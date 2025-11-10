import ParkingArea from "@/models/ParkingArea";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 404 });
    }
    const parkingArea = await ParkingArea.findById(id);
    if (!parkingArea) {
      return NextResponse.json(
        { message: "Parking area not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ parkingArea }, { status: 200 });
  } catch (error) {
    console.log("Error in /api/parking-area/get-parking-area");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
