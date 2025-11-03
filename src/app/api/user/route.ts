import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await User.find({}).select("-password -__v").lean();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.log("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
