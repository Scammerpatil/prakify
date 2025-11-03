import Booking from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const areaId = searchParams.get("areaId");
    if (!areaId) {
      return NextResponse.json(
        { error: "areaId is required" },
        { status: 400 }
      );
    }
    const startTime = new Date();
    const bookings = await Booking.find({
      area: areaId,
      startTime: { $gte: startTime },
    });
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.log("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
