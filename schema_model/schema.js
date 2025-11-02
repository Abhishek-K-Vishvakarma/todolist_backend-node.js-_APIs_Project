import mongoose from "mongoose";

const AddingSomethingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userName: { type: String, required: true },
    list: [
      {
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("AddingSomething", AddingSomethingSchema);
