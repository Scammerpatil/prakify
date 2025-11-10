import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import User from "@/models/User";
import ParkingArea from "@/models/ParkingArea";

dbConfig();

const createTokenAndResponse = (data: object, route: string) => {
  const token = jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: "7d" });
  const response = NextResponse.json({
    message: "Login successful",
    route,
    token,
  });
  response.cookies.set("token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
  });
  return response;
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { message: "Please fill all the fields" },
      { status: 400 }
    );
  }
  try {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return createTokenAndResponse(
        {
          id: "Admin",
          email,
          role: "admin",
          name: "Admin",
          profileImage:
            "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg",
          isVerified: true,
        },
        "/admin/dashboard"
      );
    }
    if (!email.includes("@")) {
      const parkingArea = await ParkingArea.findOne({
        "staffLoginCredentials.username": email,
      });
      if (!parkingArea) {
        return NextResponse.json(
          { message: "User not found. Please register first." },
          { status: 404 }
        );
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        parkingArea.staffLoginCredentials.password
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid password. Please try again." },
          { status: 401 }
        );
      }
      var data = {
        id: parkingArea._id,
        email: parkingArea.contactEmail,
        role: "parking-area",
        name: parkingArea.name,
        profileImage: parkingArea.displayImage,
      };
      return createTokenAndResponse(data, "/parking-area/dashboard");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please register first." },
        { status: 404 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password. Please try again." },
        { status: 401 }
      );
    }
    var data = {
      id: user._id,
      email: user.email,
      role: "user",
      name: user.name,
      profileImage: user.profileImage,
    };
    return createTokenAndResponse(data, "/user/dashboard");
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred while logging in" },
      { status: 500 }
    );
  }
}
