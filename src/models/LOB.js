import mongoose from "mongoose";

const lobSchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    }
});

export default mongoose.model("LOB", lobSchema);