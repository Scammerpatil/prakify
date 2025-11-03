"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import { Booking, ParkingArea, User } from "@/Types";
import { IconCancel, IconPlus, IconRestore } from "@tabler/icons-react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function SlotsPage() {
  const { user } = useAuth() as unknown as { user: User };
  const searchParams = useSearchParams();
  const [newBooking, setNewBooking] = useState({
    user: user?._id || "",
    slot: "",
    area: "",
    vehicleNumber: user?.vehicle.number || "",
    date: new Date(),
    slots: 1,
    startTime: "",
    extended: false,
    extensionCount: 0,
    status: "active",
    totalAmount: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState({
    id: "",
    name: "",
  });
  const [loading, setLoading] = useState(true);
  const [parkingArea, setParkingArea] = useState<ParkingArea>();
  const areaId = searchParams.get("id");

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/areas/slots?id=${areaId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setParkingArea(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `/api/slots/get-slots-by-area?areaId=${areaId}`
      );
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    if (areaId) {
      fetchSlots();
      fetchBookings();
    }
  }, [areaId]);

  const handleSlotBooking = async () => {
    (document.getElementById("add-new-booking") as HTMLDialogElement).close();
    try {
      const res = axios.post("/api/slots/create-booking", {
        booking: newBooking,
      });
      toast.promise(res, {
        loading: "Booking your slot...",
        success: (data) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount: data.data.order.amount,
            currency: "INR",
            name: "Prakify",
            description: "Test Transaction",
            image: "/dashboard-preview.webp",
            order_id: data.data.order.id,
            handler: (orderData: any) => {
              const res = axios.post("/api/slots/book-slot", {
                booking: data.data.booking,
                paymentDetails: orderData,
              });
              toast.promise(res, {
                loading: "Finalizing your booking...",
                success: "Slot booked successfully!",
                error: "Failed to book the slot.",
              });
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
          };
          const razorpay = new window.Razorpay(options);
          razorpay.on("payment.failed", function (response: any) {
            alert(response.error.description);
          });
          razorpay.open();
          return "Slot booked successfully!";
        },
        error: (e) => {
          return e.response?.data?.message || "Failed to book the slot.";
        },
      });
    } catch (error) {
      console.log("Error in booking slot:", error);
      toast.error("Failed to book the slot. Please try again.");
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <Title title={`More Details about ${parkingArea?.name}`} />
      <div className="card bg-base-300 shadow-xl mt-6">
        {parkingArea?.displayImage && (
          <figure>
            <img
              src={parkingArea?.displayImage}
              alt={parkingArea?.name}
              className="w-full h-64 object-cover"
            />
          </figure>
        )}

        <div className="card-body">
          <h2 className="card-title text-2xl font-semibold">
            {parkingArea?.name}
          </h2>
          <p className="text-base-content/60">
            {parkingArea?.address.street}, {parkingArea?.address.village},{" "}
            {parkingArea?.address.taluka}, {parkingArea?.address.district},{" "}
            {parkingArea?.address.state} - {parkingArea?.address.pincode}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <p>
                <strong>Email:</strong> {parkingArea?.contactEmail}
              </p>
              <p>
                <strong>Phone:</strong> {parkingArea?.contactPhone}
              </p>
              <p>
                <strong>Total Slots:</strong> {parkingArea?.totalSlots}
              </p>
              <p>
                <strong>Available Slots:</strong> {parkingArea?.availableSlots}
              </p>
              <p>
                <strong>Hourly Rate:</strong> ₹{parkingArea?.hourlyRate}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <a
                href={`https://www.google.com/maps?q=${parkingArea?.latitude},${parkingArea?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-outline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Slots Information</h3>
        {parkingArea?.slots && parkingArea?.slots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {parkingArea?.slots.map((slot: any) => {
              return (
                <button
                  key={slot._id}
                  onClick={() => {
                    setSelectedSlot({
                      id: slot._id,
                      name: slot.slotNumber,
                    });
                    setNewBooking({
                      ...newBooking,
                      slot: slot._id || "",
                      area: parkingArea?._id || "",
                    });
                    (
                      document.getElementById(
                        "add-new-booking"
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  className={`card shadow-md border border-base-200 p-4 text-center ${
                    slot.status === "available"
                      ? "bg-success/10 cursor-pointer hover:bg-success/20"
                      : "bg-error/10 cursor-not-allowed"
                  }`}
                >
                  <p className="font-semibold">
                    Slot {slot.slotNumber.split("-")[1]}-
                    {slot.slotNumber.split("-")[2]}
                  </p>
                  <p
                    className={`text-sm ${
                      slot.status === "available"
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {slot.status === "available" ? "Available" : "Occupied"}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-base-content/60">No slot information available.</p>
        )}
      </div>
      {/* Book Slot Dialog Box */}
      <dialog
        id="add-new-booking"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <Toaster />
        <div className="modal-box max-w-6xl bg-base-100 backdrop-blur-lg">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New Booking
          </h3>
          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">
              Previous Booking Details
            </h1>
            <div className="mb-6">
              {bookings.filter(
                (booking) =>
                  booking.slot === selectedSlot.id &&
                  booking.status === "active"
              ).length === 0 ? (
                <p className="text-base-content/60 text-center">
                  No previous bookings found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full bg-base-100">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings
                        .filter(
                          (booking) =>
                            booking.slot === selectedSlot.id &&
                            booking.status === "active"
                        )
                        .map((booking, index) => (
                          <tr key={booking._id}>
                            <td>{index + 1}</td>
                            <td>
                              {new Date(booking.startTime).toLocaleString()}
                            </td>
                            <td>
                              {new Date(booking.endTime).toLocaleString()}
                            </td>
                            <td>{booking.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <h1 className="border-b text-lg font-bold mb-4">Booking Details</h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Parking Area Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Booking Area ID <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Booking Area ID"
                  value={newBooking.area}
                  readOnly
                />
              </fieldset>
              {/* Parking Area Slot */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Area Slot
                  <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Area Slot"
                  value={selectedSlot.name}
                  readOnly
                />
              </fieldset>
              {/* Date */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Date <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  min={new Date().toISOString().split("T")[0]}
                  value={new Date(newBooking.date).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    new Date(e.target.value) >= new Date() &&
                    setNewBooking({
                      ...newBooking,
                      date: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
              {/* Start Time */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Start Time <span className="text-error">*</span>
                </legend>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={newBooking.startTime}
                  min={
                    newBooking.date.toDateString() === new Date().toDateString()
                      ? new Date().toISOString().slice(11, 16)
                      : undefined
                  }
                  onChange={(e) => {
                    // Ensure that the selected time is not in the past
                    const selectedDateTime = new Date(
                      newBooking.date.toDateString() + " " + e.target.value
                    );
                    if (selectedDateTime >= new Date()) {
                      setNewBooking({
                        ...newBooking,
                        startTime: e.target.value,
                      });
                    }
                  }}
                />
              </fieldset>
              {/* Total Slots */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Total Slots <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-full"
                  value={newBooking.slots}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      slots: Number(e.target.value),
                      totalAmount:
                        Number(e.target.value) *
                        0.5 *
                        (parkingArea?.hourlyRate || 0),
                    })
                  }
                />
                <p className="fieldset-label">
                  Each slot is booked for half an hour.
                </p>
              </fieldset>
              {/* Total Amount */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Total Amount <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  readOnly
                  value={newBooking.totalAmount}
                />
              </fieldset>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-4">
              <button
                className="btn btn-error btn-outline"
                onClick={() => window.location.reload()}
              >
                <IconRestore size={16} className="mr-2" />
                Reset
              </button>
              <button className="btn btn-primary" onClick={handleSlotBooking}>
                <IconPlus size={16} className="mr-2" />
                Submit
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  (
                    document.getElementById(
                      "add-new-booking"
                    ) as HTMLDialogElement
                  ).close();
                }}
              >
                <IconCancel size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
