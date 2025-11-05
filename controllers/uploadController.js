import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import User from "../schema_model/user.js";
import UserImage from "../schema_model/userphoto.js";

// Storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

export const upload = multer({ storage });

export const UploadFile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (!req.file || !req.file.path)
      return res.status(400).json({ message: "No file uploaded!" });
    const imageUrl = req.file.path;
    let userImage = await UserImage.findOne({ userId: user._id });
    if (userImage) {
      userImage.image_url = imageUrl;
      await userImage.save();
    } else {
      userImage = await UserImage.create({
        image_url: imageUrl,
        userId: user._id,
      });
    }
    res.status(201).json({
      message: "File uploaded successfully!",
      data: userImage,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
