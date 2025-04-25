import UserModel from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../Utils/generateToken.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from 'validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();

 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false  
  }
});

 
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 5,  
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const create = async (req, res) => {
  const { name, email, password } = req.body;

  try {
     
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

     
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

     
    if (!validator.isAlphanumeric(name)) {
      return res.status(400).json({ 
        success: false,
        message: "Username can only contain letters and numbers" 
      });
    }

    if (name.length < 3 || name.length > 20) {
      return res.status(400).json({ 
        success: false,
        message: "Username must be between 3-20 characters" 
      });
    }

     
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain at least one uppercase, one lowercase, one number and be 6-20 characters" 
      });
    }

     
    const [userExist, userNameExist] = await Promise.all([
      UserModel.findOne({ email }),
      UserModel.findOne({ name })
    ]);

    if (userExist) {
      return res.status(409).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    if (userNameExist) {
      return res.status(409).json({ 
        success: false,
        message: "Username already taken" 
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 14);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);  

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      verification: verificationCode,
      verificationExpires,
    });

    await user.save();

     
    const token = generateToken(user._id);

     
    const mailOptions = {
      from: `"JobHunt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to JobHunt, ${name}!</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 24px; letter-spacing: 2px; margin: 16px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

 
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully. Verification code sent.",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error(`Registration Error: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Registration failed. Please try again.'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: "Please verify your email first" 
      });
    }

    const token = generateToken(user._id);
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error(`Login Error: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Login failed. Please try again.'
    });
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code || code.length !== 6) {
      return res.status(400).json({ 
        success: false,
        message: "Valid verification code is required" 
      });
    }

    const user = await UserModel.findOne({
      verification: code,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired verification code" 
      });
    }

    user.isVerified = true;
    user.verification = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({ 
      success: true,
      message: "Email verified successfully",
      token
    });

  } catch (error) {
    console.error(`Email Verification Error: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Email verification failed. Please try again.'
    });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid email is required" 
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email is already verified" 
      });
    }

     
    if (user.verificationExpires > Date.now()) {
      const timeLeft = Math.ceil((user.verificationExpires - Date.now()) / (60 * 1000));
      return res.status(429).json({ 
        success: false,
        message: `Please wait ${timeLeft} minutes before requesting a new code`
      });
    }

     
    const newVerificationCode = crypto.randomInt(100000, 999999).toString();
    user.verification = newVerificationCode;
    user.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    
    const mailOptions = {
      from: `"JobHunt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Verification Code</h2>
          <p>Here's your new verification code:</p>
          <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 24px; letter-spacing: 2px; margin: 16px 0;">
            ${newVerificationCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true,
      message: "New verification code sent successfully" 
    });

  } catch (error) {
    console.error(`Resend Code Error: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to resend verification code. Please try again.'
    });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Access denied. No token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(`Token Verification Error: ${error.stack}`);
    
    let message = "Invalid token";
    if (error.name === 'TokenExpiredError') {
      message = "Token expired";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Malformed token";
    }

    res.status(401).json({ 
      success: false,
      message 
    });
  }
};

const logOut = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });
  
  res.status(200).json({ 
    success: true,
    message: "Logged out successfully" 
  });
};

export { 
  create, 
  login, 
  verifyEmail, 
  resendVerificationCode, 
  verifyToken, 
  logOut,
  
};