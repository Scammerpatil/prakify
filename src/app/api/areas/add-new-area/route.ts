import ParkingArea from "@/models/ParkingArea";
import Slot from "@/models/Slot";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { area } = await req.json();
    const encryptedPassword = bcrypt.hashSync(
      area.staffLoginCredentials.password,
      10
    );
    area.staffLoginCredentials.password = encryptedPassword;
    const newArea = new ParkingArea(area);
    await newArea.save();
    const newSlots = [];
    for (let i = 1; i <= area.totalSlots; i++) {
      const slot = new Slot({
        slotNumber: `${newArea._id}-SLOT-${i}`,
        status: "available",
      });
      newSlots.push(slot);
    }
    const savedSlots = await Slot.insertMany(newSlots);
    const slotIds = savedSlots.map((slot) => slot._id);
    newArea.availableSlots = area.totalSlots;
    newArea.slots = slotIds;
    await newArea.save();
    return NextResponse.json(
      { message: "Parking area added successfully", area: newArea },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in POST /areas/add-new-area", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
