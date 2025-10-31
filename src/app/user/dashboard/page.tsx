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
} from "@tabler/icons-react";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";

export interface DashboardData {
  totalPosts: number;
  averageSentiment: number;
  positivePercentage: number;
  negativeAlerts: number;
  sentimentTrend: { date: string; sentiment: number }[];
  sentimentDistribution: { name: string; value: number }[];
  topInfluencers: { name: string; positivity: number; followers: number }[];
}

// 🌈 Dummy Data
const dashboardData: DashboardData = {
  totalPosts: 1250,
  averageSentiment: 0.68,
  positivePercentage: 76,
  negativeAlerts: 4,
  sentimentTrend: [
    { date: "Oct 01", sentiment: 0.4 },
    { date: "Oct 05", sentiment: 0.6 },
    { date: "Oct 10", sentiment: 0.8 },
    { date: "Oct 15", sentiment: 0.5 },
    { date: "Oct 20", sentiment: 0.7 },
  ],
  sentimentDistribution: [
    { name: "Positive", value: 65 },
    { name: "Neutral", value: 20 },
    { name: "Negative", value: 15 },
  ],
  topInfluencers: [
    { name: "cristiano", positivity: 88, followers: 500000000 },
    { name: "therock", positivity: 84, followers: 380000000 },
    { name: "nasa", positivity: 91, followers: 96000000 },
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
        subtitle="Your cool looking instagram analysis dashboard"
      />

      <div className="stats w-full bg-base-300">
        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-secondary">
            <IconMoodSmile width="28" height="28" />
          </div>
          <div className="stat-title">Avg Sentiment</div>
          <div className="stat-value text-secondary">
            {Math.round(data.averageSentiment * 100)}%
          </div>
          <div className="stat-desc">Overall positivity</div>
        </div>

        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-accent">
            <IconUsersGroup width="28" height="28" />
          </div>
          <div className="stat-title">Positive Comments</div>
          <div className="stat-value text-accent">
            {data.positivePercentage}%
          </div>
          <div className="stat-desc">of total analyzed</div>
        </div>

        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-error">
            <IconAlertTriangle width="28" height="28" />
          </div>
          <div className="stat-title">Negative Alerts</div>
          <div className="stat-value text-error">{data.negativeAlerts}</div>
          <div className="stat-desc">Triggered this week</div>
        </div>
        <div className="stat backdrop-blur-lg">
          <div className="stat-figure text-primary">
            <div className="avatar avatar-online">
              <div className="w-16 rounded-full">
                <img src={user?.profileImage} alt={user?.name} />
              </div>
            </div>
          </div>
          <div className="stat-value text-primary">{data.totalPosts}</div>
          <div className="stat-title">Total Posts</div>
          <div className="stat-desc">Analyzed this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-base-300/60 shadow-xl backdrop-blur-md p-4">
          <h2 className="font-semibold text-lg mb-2 text-primary uppercase text-center">
            Sentiment Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sentimentTrend}>
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: "#818cf8" }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-base-300/60 shadow-xl backdrop-blur-md p-4">
          <h2 className="font-semibold text-lg mb-2 text-primary uppercase text-center">
            Sentiment Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.sentimentDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.sentimentDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-base-200/60 shadow-xl backdrop-blur-md p-4">
        <h2 className="font-semibold text-lg mb-4 text-primary uppercase text-center">
          Top Influencers by Positivity
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Positivity</th>
                <th>Followers</th>
              </tr>
            </thead>
            <tbody>
              {data.topInfluencers.map((inf, i) => (
                <tr key={i}>
                  <th>{i + 1}</th>
                  <td className="font-medium">@{inf.name}</td>
                  <td>{inf.positivity}%</td>
                  <td>{inf.followers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
