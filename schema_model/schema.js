import mongoose from "mongoose";

const AddingSomethingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
export default mongoose.model("AddingSomething", AddingSomethingSchema);
