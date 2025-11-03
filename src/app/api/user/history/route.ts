import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import Booking from "@/models/Booking";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decodedId = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const userId = decodedId.id;
    const bookings = await Booking.find({ user: userId }).populate(
      "slot area transactionId"
    );
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
