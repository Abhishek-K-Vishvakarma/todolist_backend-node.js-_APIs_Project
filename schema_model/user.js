import mongoose from "mongoose";

const SignUpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String },
    role: { type: String, enum: ["User", "Customer", "Admin"], default: "User" },
    age: { type: Number },
    otp: { type: String },
    otpExpiresAt: { type: Date, expires: '5m' },
    isVerified: { type: Boolean, default: false },
    token : {type: String}
  },
  { timestamps: true }
);

export default mongoose.model("User", SignUpSchema);
