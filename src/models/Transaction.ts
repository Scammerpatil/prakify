import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "razorpay", "wallet"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
export default Transaction;
