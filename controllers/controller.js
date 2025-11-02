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
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({
        message: "Name is required!",
        status: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!", status: false });
    }
    let userList = await AddingSomething.findOne({ userId });
    if (!userList) {
      userList = new AddingSomething({
        userId,
        userName: user.name,
        list: [{ name }],
      });
    } else {
      const duplicate = userList.list.find((item) => item.name === name);
      if (duplicate) {
        return res.status(400).json({
          message: "This item already exists in your list!",
          status: false,
        });
      }
      userList.list.push({ name });
    }
    const savedList = await userList.save();
    res.status(201).json({
      message: "Item added successfully!",
      data: savedList,
      status: true,
      status_code: 201,
      date_and_time: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      status: false,
    });
  }
};


const GetName = async (req, res) => {
  try {
    const findAllName = await AddingSomething.find({ userId: req.user._id });
    res.status(200).json({ message: "All names geting!", findAllName });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
}

const EditName = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedItem = await AddingSomething.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({
        message: "Item not found or you are not authorized to edit it!",
        status: false,
      });
    }
    res.status(200).json({
      message: "Name updated successfully!",
      data: updatedItem,
      status_code: 200,
      status: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

const DeleteName = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedItem = await AddingSomething.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Item not found or you are not authorized to delete it!",
        status: false,
      });
    }

    res.status(200).json({
      message: "Item deleted successfully!",
      status: true,
      status_code: 200,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


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

const getTokenUser = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token not found in cookies or header", status_code: 401 });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", status_code: 404 });
    }
    res.status(200).json({
      message: "Token verified successfully",
      status_code: 200,
      user,
      token,
    });
  } catch (err) {
    res.status(401).json({
      message: "Invalid or expired token",
      status_code: 401,
      error: err.message,
    });
  }
}

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
    if (!user) return res.status(404).json({ message: "No user found with this email!" });
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.token = resetToken;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    // const resetUrl = `https://todolist-frontend-react-vite-ui-pro.vercel.app/reset-password/${resetToken}`;
    // const transporter = nodeMailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL,
    //     pass: process.env.GMAIL_APP_PASSWORD,
    //   },
    // });

    // await transporter.sendMail({
    //   from: process.env.EMAIL,
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   html: `
    //     <p>Hello ${ user.name },</p>
    //     <p>Click below to reset your password:</p>
    //     <a href="${ resetUrl }">${ resetUrl }</a>
    //     <p>This link will expire in 15 minutes.</p>
    //   `,
    // });
    res.status(200).json({ message: "Password reset email sent successfully!", token: resetToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token!" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export {
  AddName, GetName, EditName, DeleteName, Signup, verifyEmail,
  GetAllUsers, otpUpdate, LoginUser, DelUsersById, LogoutUser, EditUser,
  ForgotPassword, ResetPassword, getTokenUser
};