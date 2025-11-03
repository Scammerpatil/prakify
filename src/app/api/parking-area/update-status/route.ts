import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, newStatus } = await req.json();
    if (!bookingId || !newStatus) {
      return NextResponse.json({ success: false, message: "Missing fields" });
    }

    const booking = await Booking.findById(bookingId).populate("slot");
    if (!booking)
      return NextResponse.json({
        success: false,
        message: "Booking not found",
      });

    await Booking.findByIdAndUpdate(bookingId, { status: newStatus });
    return NextResponse.json({
      success: true,
      message: `Booking ${newStatus}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
