import dbConfig from "@/config/db.config";
import ParkingArea from "@/models/ParkingArea";
import { NextResponse } from "next/server";

dbConfig();

export async function GET() {
  try {
    const areas = await ParkingArea.find().populate("slots");
    return NextResponse.json({ areas }, { status: 200 });
  } catch (error) {
    console.log("Error in GET /areas", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
