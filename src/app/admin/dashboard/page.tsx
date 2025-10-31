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
import {
  IconChartLine,
  IconMoodSmile,
  IconAlertTriangle,
  IconUsersGroup,
  IconCar,
  IconMoneybag,
} from "@tabler/icons-react";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";

export interface DashboardData {
  totalVehicles: number;
  occupancyRateNumber: number;
  revenueToday: number;
  totalRegisteredParking: number;
  avgStayDuration: number;
  occupancyRate: { day: string; occupancy: number }[];
  recentActivities: { vehicleNumber: string; time: string; action: string }[];
}

// 🌈 Dummy Data
const dashboardData: DashboardData = {
  totalVehicles: 1250,
  occupancyRateNumber: 68,
  revenueToday: 760000,
  totalRegisteredParking: 4,
  avgStayDuration: 3.5,
  occupancyRate: [
    { day: "Mon", occupancy: 40 },
    { day: "Tue", occupancy: 55 },
    { day: "Wed", occupancy: 60 },
    { day: "Thu", occupancy: 70 },
    { day: "Fri", occupancy: 80 },
    { day: "Sat", occupancy: 75 },
    { day: "Sun", occupancy: 65 },
  ],
  recentActivities: [
    { vehicleNumber: "AB123CD", time: "10:30 AM", action: "Parked" },
    { vehicleNumber: "EF456GH", time: "11:00 AM", action: "Exited" },
    { vehicleNumber: "IJ789KL", time: "11:15 AM", action: "Parked" },
    { vehicleNumber: "MN012OP", time: "11:30 AM", action: "Parked" },
  ],
};

// 🎨 Gradient colors
const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
];

export default function DashboardPage() {
  const data = dashboardData;
  const { user } = useAuth();
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
          <div className="stat-title">Occupancy Rate</div>
          <div className="stat-value text-accent">
            {data.occupancyRateNumber}%
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
            Weekly Occupancy Rate
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.occupancyRate}>
              <Line
                type="monotone"
                dataKey="occupancy"
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
                    <td>{activity.time}</td>
                    <td>{activity.action}</td>
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
