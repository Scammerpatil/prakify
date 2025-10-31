import ParkingArea from "@/models/PrakingArea";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const areaId = searchParams.get("id");
    if (!areaId) {
      return NextResponse.json(
        { message: "Area ID is required" },
        { status: 400 }
      );
    }
    const parkingArea = await ParkingArea.findById(areaId).populate("slots");
    if (!parkingArea) {
      return NextResponse.json(
        { message: "Parking area not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(parkingArea);
  } catch (error) {
    console.log("Error in fetching slots:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
