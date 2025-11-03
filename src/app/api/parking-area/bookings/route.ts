import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email vehicle.number")
      .populate("slot", "slotNumber status")
      .populate("area", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
