"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { IconUsersGroup, IconCar, IconMoneybag } from "@tabler/icons-react";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { User } from "@/Types";

export interface DashboardData {
  totalVehicles: number;
  bookingRateNumber: number;
  revenueToday: number;
  totalRegisteredParking: number;
  avgStayDuration: number;
  bookingRate: { day: string; booking: number }[];
  recentActivities: { vehicleNumber: string; time: string; action: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalVehicles: 0,
    bookingRateNumber: 0,
    revenueToday: 0,
    totalRegisteredParking: 0,
    avgStayDuration: 0,
    bookingRate: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth() as unknown as { user: User };
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboards/admin", {
        method: "GET",
      });
      const result = await res.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Title
        title={`Welcome back, ${user?.name || "User"}!`}
        subtitle="Check out the latest parking analytics and insights."
      />

      <div className="stats w-full bg-base-300">
        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-secondary">
            <IconCar width="28" height="28" />
          </div>
          <div className="stat-title">Total Vehicles</div>
          <div className="stat-value text-secondary">{data.totalVehicles}</div>
          <div className="stat-desc">Parked today</div>
        </div>

        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-accent">
            <IconUsersGroup width="28" height="28" />
          </div>
          <div className="stat-title">Booking Rate</div>
          <div className="stat-value text-accent">
            {data.bookingRateNumber}%
          </div>
          <div className="stat-desc">of total analyzed</div>
        </div>

        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-error">
            <IconMoneybag width="28" height="28" />
          </div>
          <div className="stat-title">Revenue Today</div>
          <div className="stat-value text-error">₹ {data.revenueToday}</div>
          <div className="stat-desc">Generated parking fee today</div>
        </div>
        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-primary">
            <div className="avatar avatar-online">
              <div className="w-16 rounded-full">
                <img src={user?.profileImage} alt={user?.name} />
              </div>
            </div>
          </div>
          <div className="stat-value text-primary">
            {data.avgStayDuration} hrs
          </div>
          <div className="stat-title">Average Stay Duration</div>
          <div className="stat-desc">Analyzed this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-base-300 shadow-xl backdrop-blur-md p-4">
          <h2 className="font-semibold text-lg mb-2 text-primary uppercase text-center">
            Weekly Booking Rate
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.bookingRate}>
              <Line
                type="monotone"
                dataKey="booking"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-primary-content)" }}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-base-content)"
              />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-base-300 shadow-xl backdrop-blur-md p-4">
          <h2 className="font-semibold text-lg mb-4 text-primary uppercase text-center">
            Recent Parking Activities
          </h2>
          <div className="overflow-x-auto bg-base-100 overflow-y-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle Number</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivities.map((activity, i) => (
                  <tr key={i}>
                    <th>{i + 1}</th>
                    <td className="font-medium">{activity.vehicleNumber}</td>
                    <td>{new Date(activity.time).toLocaleString()}</td>
                    <td className="capitalize">{activity.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
