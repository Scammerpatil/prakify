"use client";
import { Booking } from "@/Types";
import { useEffect, useState } from "react";
import { IconCar, IconClock, IconUser, IconMapPin } from "@tabler/icons-react";
import axios from "axios";
import toast from "react-hot-toast";
import Title from "@/components/Title";
import Loading from "@/components/Loading";

export default function CheckInCheckOutPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parking-area/bookings");
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = axios.patch("/api/parking-area/update-status", {
        bookingId,
        newStatus,
      });
      toast.promise(res, {
        loading: "Updating status...",
        success: "Status updated successfully!",
        error: "Failed to update status.",
      });
    } catch (err) {
      toast.error("An error occurred while updating status.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <Loading />;
  return (
    <>
      <Title title="Report" subtitle="Manage bookings" />

      <div className="overflow-x-auto bg-base-300 p-4 rounded-lg shadow">
        <table className="table table-zebra w-full text-base">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Vehicle</th>
              <th>Slot</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: Booking, i) => (
              <tr key={b._id}>
                <td>{i + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <IconUser size={18} />
                    <span>{b.user?.name}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <IconCar size={18} />
                    <span>{b.user?.vehicle?.number}</span>
                  </div>
                </td>
                <td>{b.slot?.slotNumber}</td>
                <td>{new Date(b.startTime).toLocaleString()}</td>
                <td>{new Date(b.endTime).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      b.status === "active"
                        ? "badge-warning"
                        : b.status === "checked-in" || b.status === "completed"
                        ? "badge-success"
                        : "badge-error"
                    } capitalize`}
                  >
                    {b.status}
                  </span>
                </td>
                <td>₹{b.totalAmount?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
