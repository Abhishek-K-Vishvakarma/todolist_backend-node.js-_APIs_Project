import AddingSomething from "../schema_model/schema.js"
import User from "../schema_model/user.js"
import sendMails from "../utils.js";
import crypto from "crypto";
import bodyParser from "body-parser";
import otpGenerate from "otp-generator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer";
const AddName = async (req, res) => {
  try {
    const { name } = req.body;
    const userName = await AddingSomething.findOne({ name });
    if (userName) return res.status(409).json({ message: "This name or any text already exists!" });
    const newName = new AddingSomething({ name });
    const saveName = await newName.save();
    res.status(201).json({ message: "Name or Text adding successfully!", data: { saveName }, status_code: 201, status: true, date_and_time: new Date() });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

const GetName = async (req, res) => {
  try {
    const findAllName = await AddingSomething.find({});
    res.status(200).json({ message: "All names geting!", findAllName });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const EditName = async (req, res) => {
  try {
    const id = req.params.id;
    const edit = await AddingSomething.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ message: "Name Updated Success!", edit, status_code: 200, status: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const DeleteName = async (req, res) => {
  try {
    const id = req.params.id;
    await AddingSomething.findByIdAndDelete(id);
    res.status(200).json({ message: "Name Deleted Success!", status_code: 204, status: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const Signup = async (req, res) => {
  try {
    const { name, email, password, gender, role, age } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPass,
      gender,
      age,
      otp,
      role,
      otpExpiresAt: otpExpiry,
      isVerified: false,
    });

    await sendMails(email, otp);
    const savedUser = await newUser.save();

    res.status(200).json({ message: "OTP sent! Please verify your email.", savedUser });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User email not found!" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified!" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP!" });

    if (user.otpExpiresAt < new Date()) {

      return res.status(400).json({ message: "OTP expired! Please request a new one." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) res.status(400).json({ message: "User email not found!" });
    if (user.isVerified == false) return res.status(400).json({ message: "Please verify email via otp!" });
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) return res.status(400).json({ message: "Password does not matched!" });
    const token = jwt.sign({ _id: user.id, name: user.name, email: user.email, role: user.role, gender: user.gender }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful!", login: { _id: user._id, email: user.email, token: token } });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error :", err });
  }
}

const LogoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logout successful!" });
};


const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ message: "All Users geting!", users });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const DelUsersById = async (req, res) => {
  try {
    const id = await User.findByIdAndDelete(req.params.id);
    if (id == null) return res.status(404).json({ message: "User data already deleted for this id", status_code: 404 });
    res.status(200).json({ message: `User single data delete successfully : ${ id._id }, ${ id.name }`, status_code: 204 });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const EditUser = async (req, res) => {
  try {
    const id = req.params.id;
    const edit = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ message: "Single user Updated Successfully!", edit, status_code: 200, status: true });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const otpUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isVerified == true) return res.status(409).json({ message: "User already verified!" });
    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const newExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiresAt = newExpiry;
    await user.save();
    await sendMails(user.email, newOtp);
    res.status(200).json({ message: "New OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });
    const token = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.token = resetToken;
    await user.save();
    const resetTokenURL = `http://localhost:5173/reset-password/${token}`;
    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h3>Hello ${ user.name },</h3>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${ resetTokenURL }">${ resetTokenURL }</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    await user.save();
    res.status(200).json({ message: "Reset link sent to email", resetToken: token});
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const ResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ token: hashedToken });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.token = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" }); 
  } catch (err) {
    return res.status(500).json({ message: "Internal Server error", err });
  }
};


export {
  AddName, GetName, EditName, DeleteName, Signup, verifyEmail,
  GetAllUsers, otpUpdate, LoginUser, DelUsersById, LogoutUser, EditUser,
  ForgotPassword, ResetPassword
};