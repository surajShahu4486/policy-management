import mongoose from "mongoose";

const carrierSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, unique: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("Carrier", carrierSchema);
