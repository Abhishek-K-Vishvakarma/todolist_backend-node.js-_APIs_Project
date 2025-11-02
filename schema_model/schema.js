import mongoose from "mongoose";

const AddingSomethingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

AddingSomethingSchema.index({ name: 1, userId: 1 }, { unique: true });
export default mongoose.model("AddingSomething", AddingSomethingSchema);
