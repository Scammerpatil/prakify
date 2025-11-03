"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { Booking, User } from "@/Types";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  IconCar,
  IconClock,
  IconMapPin,
  IconRefresh,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";

export default function HistoryPage() {
  const { user } = useAuth() as unknown as { user: User };
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/history");
      if (!res.ok) throw new Error("Failed to fetch booking history");
      setHistory(await res.json());
    } catch (error) {
      console.error("Error fetching booking history:", error);
      toast.error("Unable to load booking history.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendBooking = async (bookingId: string) => {
    const booking = history.find((b) => b._id === bookingId);
    if (!booking) return toast.error("Booking not found");

    const slots = prompt("Enter number of half-hour slots to extend:");
    const slotCount = Number(slots);
    if (!slotCount || slotCount <= 0) return toast.error("Invalid slot count");

    try {
      const res = await axios.post("/api/user/extend-booking", {
        bookingId,
        slots: slotCount,
      });
      if (res.status !== 200) {
        return toast.error(res.data.message || "Cannot extend booking");
      }
      if (!confirm("Adjacent slot available. Proceed to payment?")) return;
      const order = await axios.post("/api/slots/create-booking", {
        booking: {
          user: user._id,
          area: booking.area._id,
          slot: booking.slot._id,
          vehicleNumber: booking.vehicleNumber,
          date: new Date(booking.startTime),
          startTime: dayjs(booking.endTime).format("HH:mm"),
          slots: slotCount,
          extended: true,
          totalAmount:
            (booking.totalAmount /
              (dayjs(booking.endTime).diff(dayjs(booking.startTime), "minute") /
                30)) *
            slotCount,
        },
      });
      if (!order) {
        return toast.error("Failed to create booking for extension");
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.data.order.amount,
        currency: "INR",
        name: "Prakify",
        description: "Booking Extension Payment",
        image: "/dashboard-preview.webp",
        order_id: order.data.order.id,
        handler: async (paymentDetails: any) => {
          const confirmRes = await axios.post("/api/slots/book-slot", {
            booking: order.data.booking,
            paymentDetails: paymentDetails,
          });
          console.log("Payment confirmation response:", confirmRes);
          if (confirmRes.status === 201) {
            toast.success("Booking extended successfully!");
            fetchHistory();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#2563eb" },
      });

      razorpay.on("payment.failed", (err: any) => {
        toast.error(err.error.description || "Payment failed");
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Error extending booking:", error);
      toast.error(error.response?.data?.message || "Failed to extend booking");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Title
        title="Booking History"
        subtitle="Your past bookings at a glance"
      />
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="overflow-x-auto bg-base-200 rounded-lg p-4 mt-4">
        {history.length === 0 ? (
          <div className="text-center text-base-content/70 py-10">
            <IconCar size={40} className="mx-auto mb-3 text-primary" />
            <p className="text-lg font-semibold">No bookings found</p>
            <p className="text-sm">
              Your past booking history will appear here.
            </p>
          </div>
        ) : (
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr className="text-primary text-base">
                <th>#</th>
                <th>Parking Area</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((b, i) => (
                <tr key={b._id}>
                  <td>{i + 1}</td>
                  <td className="flex items-center gap-2">
                    <IconMapPin size={18} className="text-primary" />
                    {b.area?.name || "N/A"}
                  </td>
                  <td>{b.slot?.slotNumber || "N/A"}</td>
                  <td className="font-semibold">{b.vehicleNumber}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <IconClock size={16} />
                      {dayjs(b.startTime).format("DD MMM YYYY, hh:mm A")}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <IconClock size={16} />
                      {dayjs(b.endTime).format("DD MMM YYYY, hh:mm A")}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge capitalize ${
                        b.status === "checked-in" ||
                        b.status === "active" ||
                        b.status === "completed"
                          ? "badge-success"
                          : b.status === "cancelled"
                          ? "badge-error"
                          : "badge-warning"
                      } badge-outline`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>₹{b.totalAmount?.toFixed(2) || "0.00"}</td>
                  <td>
                    {dayjs().isAfter(dayjs(b.endTime)) ||
                    b.status === "completed" ? (
                      <span className="text-base-content/70 italic btn btn-sm btn-disabled">
                        Extend not available
                      </span>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleExtendBooking(b._id!)}
                      >
                        Extend Time
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchHistory}
          className="btn btn-primary btn-outline flex items-center gap-2"
        >
          <IconRefresh size={18} />
          Refresh History
        </button>
      </div>
    </>
  );
}
