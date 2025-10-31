import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema(
  {
    slotNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "occupied"],
      default: "available",
    },
    currentBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

const Slot = mongoose.models.Slot || mongoose.model("Slot", slotSchema);

export default Slot;
