import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true, trim: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
