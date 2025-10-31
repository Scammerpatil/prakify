import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    profileImage: { type: String },
    password: { type: String, required: true },
    vehicle: {
      number: { type: String, required: true, unique: true },
      model: { type: String },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
