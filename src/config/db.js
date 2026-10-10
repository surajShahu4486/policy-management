import mongoose from "mongoose";

const connectDB = async () => {

  try {

    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing in .env");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error");
    console.error(error.message);

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }

    process.exit(1);
  }
}
export default connectDB;