"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import {
  IconChartLine,
  IconMapPin,
  IconCar,
  IconCash,
  IconClock,
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";
import Title from "@/components/Title";

type AreaStat = {
  _id: string;
  name: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  bookedSlots: number;
  hourlyRate: number;
  bookingsToday: number;
  revenueToday: number;
  averageStayMinutes: number;
  totalExtensions: number;
};

export default function ParkingAreaDashboard() {
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);
  const [areas, setAreas] = useState<AreaStat[]>([]);
  const [bookingsOverTime, setBookingsOverTime] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/dashboards/parking-area");
      const data = res.data;
      setTotals(data.totals);
      setAreas(data.areas || []);
      setBookingsOverTime(data.bookingsOverTime || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !totals) return <Loading />;

  const pieData = [
    { name: "Checked In", value: totals.checkIn },
    { name: "Checked Out", value: totals.checkOut },
    { name: "Active", value: totals.active },
  ];

  const COLORS = [
    "var(--color-success)",
    "var(--color-error)",
    "var(--color-warning)",
  ];

  return (
    <div className="space-y-2">
      <Title
        title="Welcome to Parking Area Dashboard"
        subtitle="Manage your parking areas efficiently"
      />

      {/* --- TOP STATS --- */}
      <div className="stats w-full shadow bg-base-300">
        <div className="stat shadow">
          <div className="stat-figure text-primary">
            <IconMapPin size={28} />
          </div>
          <div className="stat-title">Parking Areas</div>
          <div className="stat-value text-primary">{totals.totalAreas}</div>
          <div className="stat-desc">Total parking areas managed</div>
        </div>

        <div className="stat shadow">
          <div className="stat-figure text-success">
            <IconCar size={28} />
          </div>
          <div className="stat-title">Total Slots</div>
          <div className="stat-value text-success">{totals.totalSlots}</div>
          <div className="stat-desc">
            {totals.totalAvailable} available · {totals.totalOccupied} occupied
          </div>
        </div>

        <div className="stat shadow">
          <div className="stat-figure text-accent">
            <IconCash size={28} />
          </div>
          <div className="stat-title">Revenue (Today)</div>
          <div className="stat-value text-accent">
            ₹{(totals.totalRevenueToday || 0).toFixed(2)}
          </div>
          <div className="stat-desc">
            {totals.totalBookingsToday} bookings today
          </div>
        </div>

        <div className="stat shadow">
          <div className="stat-figure text-warning">
            <IconClock size={28} />
          </div>
          <div className="stat-title">Avg Stay (mins)</div>
          <div className="stat-value text-warning">
            {Math.round(
              areas.reduce((s, a) => s + (a.averageStayMinutes || 0), 0) /
                (areas.length || 1)
            )}
          </div>
          <div className="stat-desc">
            {totals.totalExtensions} total extensions
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-300 p-4">
          <h3 className="font-semibold mb-2 text-center uppercase">
            Bookings (Last 7 Days)
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={bookingsOverTime}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-300 p-4">
          <h3 className="font-semibold mb-2 text-center uppercase">
            Booking Distribution
          </h3>
          <div className="flex items-center justify-center h-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  label
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- AREA DETAILS TABLE --- */}
      <div className="card bg-base-300 p-4">
        <h3 className="font-semibold mb-3 text-center uppercase">
          Area Details
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full bg-base-100">
            <thead>
              <tr>
                <th>Area</th>
                <th>Total</th>
                <th>Available</th>
                <th>Occupied</th>
                <th>Bookings Today</th>
                <th>Revenue Today</th>
                <th>Avg Stay (mins)</th>
              </tr>
            </thead>
            <tbody>
              {areas.length > 0 ? (
                areas.map((a) => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.totalSlots}</td>
                    <td>{a.availableSlots}</td>
                    <td>{a.occupiedSlots}</td>
                    <td>{a.bookingsToday}</td>
                    <td>₹{(a.revenueToday || 0).toFixed(2)}</td>
                    <td>{a.averageStayMinutes || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No areas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
