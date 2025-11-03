import dbConfig from "@/config/db.config";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import Booking from "@/models/Booking";

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const { booking, paymentDetails } = await req.json();
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = paymentDetails;
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;
    if (!isAuthentic) {
      return NextResponse.json(
        { message: "invalid payment signature", error: true },
        { status: 400 }
      );
    }
    const transaction = new Transaction({
      amount: booking.totalAmount,
      paymentMethod: "razorpay",
      status: "completed",
    });
    await transaction.save();
    const newBooking = new Booking({
      user: booking.user,
      slot: booking.slot,
      area: booking.area,
      vehicleNumber: booking.vehicleNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: booking.totalAmount,
      transactionId: transaction._id,
    });
    await newBooking.save();
    return NextResponse.json(
      { message: "Slot booked successfully", booking: newBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error booking slot:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
