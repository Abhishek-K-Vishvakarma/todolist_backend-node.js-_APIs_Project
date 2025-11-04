import mongoose from "mongoose";

const UploadImage = new mongoose.Schema({
  image_url: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
}, { timestamps: true });

export default mongoose.model("UserImage", UploadImage);