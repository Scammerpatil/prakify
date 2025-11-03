import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    area: {
      type: Schema.Types.ObjectId,
      ref: "ParkingArea",
      required: true,
    },
    vehicleNumber: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    extended: { type: Boolean, default: false },
    extensionCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "checked-in", "completed", "cancelled"],
      default: "active",
    },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
