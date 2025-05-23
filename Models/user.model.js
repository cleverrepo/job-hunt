import mongoose from "mongoose";

 
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true,min:6 },
  verification: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationExpires: Date,
});


const UserModel = mongoose.model("User", userSchema);

export default UserModel;
