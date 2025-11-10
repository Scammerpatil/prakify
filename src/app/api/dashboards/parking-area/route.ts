import dayjs from "dayjs";
import Booking from "@/models/Booking";
import Slot from "@/models/Slot";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConfig from "@/config/db.config";
import ParkingArea from "@/models/ParkingArea";

dbConfig();

export async function GET(req: NextResponse) {
  try {
    const token = req.cookies.get("token")?.value;
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
    const areas = await ParkingArea.find()
      .populate({
        path: "slots",
        model: Slot,
      })
      .lean();

    const areaStats = await Promise.all(
      areas.map(async (area: any) => {
        const slots = area.slots || [];

        const totalSlots = area.totalSlots || slots.length || 0;
        const availableSlots = slots.filter(
          (s: any) => s.status === "available"
        ).length;
        const occupiedSlots = slots.filter(
          (s: any) => s.status === "occupied"
        ).length;
        const bookedSlots = slots.filter(
          (s: any) => s.status === "booked"
        ).length;

        const startOfDay = dayjs().startOf("day").toDate();
        const endOfDay = dayjs().endOf("day").toDate();

        const bookingsToday = await Booking.countDocuments({
          area: area._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        const revenueTodayAgg = await Booking.aggregate([
          {
            $match: {
              area: area._id,
              createdAt: { $gte: startOfDay, $lte: endOfDay },
              status: "active",
            },
          },
          { $group: { _id: null, rev: { $sum: "$totalAmount" } } },
        ]);

        const revenueToday = revenueTodayAgg[0]?.rev || 0;

        // Average stay over the last 7 days
        const sevenDaysAgo = dayjs().subtract(6, "day").startOf("day").toDate();
        const avgAgg = await Booking.aggregate([
          {
            $match: {
              area: area._id,
              status: "completed",
              createdAt: { $gte: sevenDaysAgo, $lte: endOfDay },
            },
          },
          {
            $project: {
              durationMinutes: {
                $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60],
              },
            },
          },
          {
            $group: { _id: null, avgMinutes: { $avg: "$durationMinutes" } },
          },
        ]);

        const averageStayMinutes = Math.round(avgAgg[0]?.avgMinutes || 0);

        // Total extensions
        const extensionsAgg = await Booking.aggregate([
          { $match: { area: area._id } },
          {
            $group: { _id: null, totalExtensions: { $sum: "$extensionCount" } },
          },
        ]);

        const totalExtensions = extensionsAgg[0]?.totalExtensions || 0;

        return {
          _id: area._id,
          name: area.name,
          totalSlots,
          availableSlots,
          occupiedSlots,
          bookedSlots,
          hourlyRate: area.hourlyRate || 0,
          bookingsToday,
          revenueToday,
          averageStayMinutes,
          totalExtensions,
        };
      })
    );

    const areaIds = areas.map((a: any) => a._id);
    const bookings = await Booking.find({ area: { $in: areaIds } }).lean();

    const totals = {
      totalAreas: areaStats.length,
      totalSlots: areaStats.reduce((s, a) => s + (a.totalSlots || 0), 0),
      totalAvailable: areaStats.reduce(
        (s, a) => s + (a.availableSlots || 0),
        0
      ),
      totalOccupied: areaStats.reduce((s, a) => s + (a.occupiedSlots || 0), 0),
      totalRevenueToday: areaStats.reduce(
        (s, a) => s + (a.revenueToday || 0),
        0
      ),
      totalBookingsToday: areaStats.reduce(
        (s, a) => s + (a.bookingsToday || 0),
        0
      ),
      totalExtensions: areaStats.reduce(
        (s, a) => s + (a.totalExtensions || 0),
        0
      ),
      checkIn: bookings.filter((b) => b.status === "checked-in").length,
      checkOut: bookings.filter((b) => b.status === "completed").length,
      active: bookings.filter((b) => b.status === "active").length,
    };

    // Bookings over 7 days
    const startRange = dayjs().subtract(6, "day").startOf("day").toDate();
    const endRange = dayjs().endOf("day").toDate();

    const bookingsOverTimeAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startRange, $lte: endRange } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bookingsOverTimeMap: Record<string, number> = {};
    bookingsOverTimeAgg.forEach((r) => (bookingsOverTimeMap[r._id] = r.count));

    const bookingsOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      bookingsOverTime.push({ date: d, count: bookingsOverTimeMap[d] || 0 });
    }

    return NextResponse.json({
      success: true,
      totals,
      areas: areaStats,
      bookingsOverTime,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: err,
    });
  }
}
