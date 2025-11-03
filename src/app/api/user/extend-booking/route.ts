import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, slots } = await req.json();
    const exisitingBooking = await Booking.findById(bookingId);
    if (!exisitingBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }
    // Check if booking is eligible for extension
    if (exisitingBooking.status !== "active") {
      return NextResponse.json(
        { message: "Only active bookings can be extended" },
        { status: 400 }
      );
    }
    // Check if adjacent time slot is available (this is a placeholder logic)
    const adjacentSlot = await Booking.findOne({
      startTime: exisitingBooking.endTime,
      endTime: new Date(
        new Date(exisitingBooking.endTime).getTime() +
          parseInt(slots) * 30 * 60 * 1000
      ),
    });
    if (adjacentSlot) {
      return NextResponse.json(
        { message: "Adjacent time slot is not available" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Adjacent time slot is available" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error extending booking:", error);
    return NextResponse.json(
      { message: "Failed to extend booking" },
      { status: 500 }
    );
  }
}
