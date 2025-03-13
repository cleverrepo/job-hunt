import UserModel from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../Utils/generateToken.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const create = async (req, res) => {
  const { name, email, password } = req.body;
  const userExist = await UserModel.findOne({ email });

  if (userExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const verification = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      verification,
      verificationExpires,
    });

    await user.save();

    generateToken(res, user._id);  

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Welcome, ${name}! 🎉</h2>
            <p style="font-size: 16px; color: #555;">Thank you for signing up! Use the verification code below to verify your email:</p>
            <h3 style="color: #fff; background: #28a745; padding: 10px; display: inline-block; border-radius: 5px;">
              ${verification}
            </h3>
            <p style="font-size: 14px; color: #777;">This code will expire in 3 minutes.</p>
            <p style="color: #777;">If you didn’t request this, please ignore this email.</p>
          </div>
        </div>`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(404).json({
      message: "Failed to register user due to an error",
      error: error.message,
    });
    console.error(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "Email not verified" });
  }

  const token = generateToken(res ,user._id); 

  res.status(200).json({
    message: "Login successful",
    success: true,
    token,
  });
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await UserModel.findOne({
      verification: code,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification failed" });
    }

    user.isVerified = true;
    user.verification = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.verificationExpires && user.verificationExpires > Date.now()) {
      return res.status(400).json({
        message: "A verification code was already sent. Please wait before requesting a new one.",
      });
    }

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verification = newVerificationCode;
    user.verificationExpires = newVerificationExpires;

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Welcome to Our App! 🎉</h2>
            <p style="font-size: 16px; color: #555;">Thank you for signing up! Use the verification code below to complete your registration:</p>
            <h3 style="color: #fff; background: #007bff; padding: 10px; display: inline-block; border-radius: 5px;">
              ${newVerificationCode}
            </h3>
            <p style="font-size: 14px; color: #777;">This code will expire in 3 minutes.</p>
            <p style="color: #777;">If you didn’t request this, please ignore this email.</p>
          </div>
        </div>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "New verification code sent successfully" });
  } catch (error) {
    console.error("Error in resending verification code:", error);
    res.status(500).json({ message: "Failed to resend verification code", error: error.message });
  }
};

export { create, login, verifyEmail, resendVerificationCode };
