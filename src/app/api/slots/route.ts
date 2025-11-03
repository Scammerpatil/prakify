import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const bookings = await Booking.find({});
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.log("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
