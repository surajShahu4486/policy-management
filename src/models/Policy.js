import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, unique: true, index: true },
    policyStartDate: Date,
    policyEndDate: Date,
    policyCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LOB",
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Carrier",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

policySchema.index({ userId: 1, policyStartDate: -1 });

export default mongoose.model("Policy", policySchema);
