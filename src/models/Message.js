import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    scheduledJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledJob",
      required: true
    },
    createdAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model("Message", messageSchema);
