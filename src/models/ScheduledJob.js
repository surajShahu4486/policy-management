import mongoose from "mongoose";

const scheduledJobSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true
    },
    processedAt: Date,
    error: String
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledJob", scheduledJobSchema);
