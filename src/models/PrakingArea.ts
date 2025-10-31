import mongoose, { Schema } from "mongoose";

const parkingAreaSchema = new Schema(
  {
    name: { type: String, required: true },
    displayImage: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    staffLoginCredentials: {
      username: { type: String, unique: true, required: true },
      password: { type: String, required: true },
    },
    address: {
      street: { type: String, required: true },
      village: { type: String, required: true },
      taluka: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
    availableSlots: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    slots: [{ type: Schema.Types.ObjectId, ref: "Slot" }],
  },
  { timestamps: true }
);

const ParkingArea =
  mongoose.models.ParkingArea ||
  mongoose.model("ParkingArea", parkingAreaSchema);

export default ParkingArea;
