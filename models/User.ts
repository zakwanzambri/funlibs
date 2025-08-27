import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  role: "admin" | "staff" | "student";
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "staff", "student"],
    default: "student",
    required: true,
  },
});

const User = models.User || model<IUser>("User", UserSchema);
export default User;
