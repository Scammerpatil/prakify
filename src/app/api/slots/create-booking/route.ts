import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuid } from "uuid";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json();
    console.log("Received booking data:", booking);
    const startTime = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    const totalMinutes = booking.slots * 30;
    endTime.setMinutes(startTime.getMinutes() + totalMinutes);

    booking.startTime = startTime;
    booking.endTime = endTime;

    console.log("Booking details:", booking);

    const existingBooking = await Booking.findOne({
      slot: booking.slot,
      $or: [
        {
          startTime: { $lt: booking.endTime },
          endTime: { $gt: booking.startTime },
        },
      ],
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "Slot is already booked", error: true },
        { status: 400 }
      );
    }

    const options = {
      amount: booking.totalAmount * 100,
      currency: "INR",
      receipt: uuid(),
    };
    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order, booking }, { status: 200 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
