import ParkingArea from "@/models/ParkingArea";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { area } = await req.json();

    if (!area || !area.name || !area.staffLoginCredentials?.password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let password = area.staffLoginCredentials.password;

    const isHashed =
      typeof password === "string" &&
      password.startsWith("$2") &&
      password.length === 60;

    if (!isHashed) {
      const encryptedPassword = bcrypt.hashSync(password, 10);
      area.staffLoginCredentials.password = encryptedPassword;
    }

    const updatedArea = await ParkingArea.findOneAndUpdate(
      { _id: area._id },
      { $set: area },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      {
        message: "Parking area added/updated successfully",
        area: updatedArea,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /areas/add-new-area", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
