import dbConfig from "@/config/db.config";
import ParkingArea from "@/models/ParkingArea";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No token found" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };
    if (!data) {
      return NextResponse.json({ error: "Invalid token" });
    }
    if (data.role === "admin" && data.email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({
        user: {
          id: "Admin",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
          name: "Admin",
          profileImage:
            "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg",
          isVerified: true,
        },
      });
    } else if (data.role === "user") {
      const user = await User.findById(data.id).select("-password");

      if (!user) {
        return NextResponse.json({ error: "User not found" });
      }
      return NextResponse.json({ user, status: 200 });
    } else if (data.role === "parking-area") {
      const user = await ParkingArea.findById(data.id).select(
        "-staffLoginCredentials.password"
      );
      if (!user) {
        return NextResponse.json({ error: "Parking area not found" });
      }
      return NextResponse.json({ user, status: 200 });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 401 });
  }
}
