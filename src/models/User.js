import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, index: true },
    dob: Date,
    address: String,
    phoneNumber: String,
    state: String,
    zipCode: String,
    email: { type: String, trim: true, lowercase: true, index: true },
    gender: String,
    userType: String,
    username: { type: String, trim: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" }
  },
  { timestamps: true }
);

userSchema.index({ firstName: 1, email: 1 });

export default mongoose.model("User", userSchema);
