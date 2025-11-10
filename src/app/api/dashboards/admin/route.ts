import User from "@/models/User";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";
import ParkingArea from "@/models/ParkingArea";

export async function GET() {
  try {
    const totalVehicles = await User.countDocuments();
    const totalRegisteredParking = await ParkingArea.countDocuments();

    // 💰 Revenue today
    const revenueTodayAgg = await Booking.aggregate([
      {
        $match: {
          startTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenueToday = revenueTodayAgg[0]?.total || 0;

    // ⏱️ Average stay duration (in hours)
    const avgStayAgg = await Booking.aggregate([
      { $match: { status: "checked-out" } },
      {
        $project: {
          duration: {
            $divide: [{ $subtract: ["$endTime", "$startTime"] }, 3600000],
          }, // convert ms → hours
        },
      },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
    ]);
    const avgStayDuration = Math.round(avgStayAgg[0]?.avgDuration || 0);

    // 📊 Weekly booking rate (Mon–Sun)
    const bookingRateAgg = await Booking.aggregate([
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: "$startTime" } },
          total: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          dayOfWeek: "$_id.dayOfWeek",
          bookingRate: { $divide: ["$activeCount", "$total"] },
        },
      },
      { $sort: { dayOfWeek: 1 } },
    ]);

    // 🗓️ Map booking rates to day names (1=Sun → 7=Sat)
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedBookingRate = dayMap.map((day, index) => {
      const found = bookingRateAgg.find((r) => r.dayOfWeek === index + 1);
      return {
        day,
        booking: found ? Math.round(found.bookingRate * 100) : 0,
      };
    });

    const totalAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
        },
      },
    ]);
    const bookingRateNumber = totalAgg[0]
      ? Math.round((totalAgg[0].activeCount / totalAgg[0].total) * 100)
      : 0;

    // 🕒 Recent activities
    const recentActivities = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("vehicleNumber startTime status")
      .lean();

    const formattedRecentActivities = recentActivities.map((a) => ({
      vehicleNumber: a.vehicleNumber,
      time: a.startTime,
      action: a.status,
    }));

    return NextResponse.json({
      totalVehicles,
      totalRegisteredParking,
      revenueToday,
      avgStayDuration,
      bookingRateNumber,
      bookingRate: formattedBookingRate,
      recentActivities: formattedRecentActivities,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
}
