import dayjs from "dayjs";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";
import dbConfig from "@/config/db.config";
import jwt from "jsonwebtoken";
import ParkingArea from "@/models/ParkingArea";

dbConfig();

export async function GET(req: Request) {
  try {
    const token = req.cookies?.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    if (!decoded?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Fetch all bookings by this user
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "area", model: ParkingArea })
      .lean();

    const totalBookings = bookings.length;
    const active = bookings.filter((b) => b.status === "active").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const totalSpent = bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const todayBookings = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= startOfDay && new Date(b.createdAt) <= endOfDay
    ).length;

    const revenueToday = bookings
      .filter(
        (b) =>
          new Date(b.createdAt) >= startOfDay &&
          new Date(b.createdAt) <= endOfDay
      )
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Average stay (for completed)
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const avgStay =
      completedBookings.length > 0
        ? Math.round(
            completedBookings.reduce(
              (sum, b) =>
                sum +
                (b.endTime && b.startTime
                  ? (new Date(b.endTime).getTime() -
                      new Date(b.startTime).getTime()) /
                    (1000 * 60)
                  : 0),
              0
            ) / completedBookings.length
          )
        : 0;

    // Booking trend (last 7 days)
    const sevenDaysAgo = dayjs().subtract(6, "day").startOf("day").toDate();
    const bookingsOverTimeAgg = await Booking.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map: Record<string, number> = {};
    bookingsOverTimeAgg.forEach((r) => (map[r._id] = r.count));
    const bookingsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      bookingsOverTime.push({ date: d, count: map[d] || 0 });
    }

    const visitedAreas = [
      ...new Map(
        bookings
          .filter((b) => b.area)
          .map((b) => [b.area._id.toString(), b.area])
      ).values(),
    ];

    return NextResponse.json({
      success: true,
      totals: {
        totalBookings,
        active,
        completed,
        cancelled,
        totalSpent,
        todayBookings,
        revenueToday,
        avgStay,
        totalAreasVisited: visitedAreas.length,
      },
      bookingsOverTime,
      visitedAreas,
    });
  } catch (err) {
    console.error("User Dashboard Error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: err,
    });
  }
}
