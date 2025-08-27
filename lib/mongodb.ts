import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
  await mongoose.connect(uri);
};
