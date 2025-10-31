"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import { ParkingArea } from "@/Types";
import { IconCancel, IconPlus, IconRestore } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function SlotsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [newBooking, setNewBooking] = useState({
    user: user?._id || "",
    slot: "",
    area: "",
    vehicleNumber: "",
    date: new Date(),
    slots: 1,
    startTime: new Date(),
    extended: false,
    extensionCount: 0,
    status: "active",
    totalAmount: 0,
  });
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

  useEffect(() => {
    if (areaId) {
      fetchSlots();
    }
  }, [areaId]);

  const handleSlotBooking = async () => {};

  if (loading) return <Loading />;
  return (
    <>
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
            {parkingArea?.slots.map((slot: any) => (
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
                  slot.status
                    ? "bg-success/10 cursor-pointer hover:bg-success/20"
                    : "bg-error/10 cursor-not-allowed "
                }`}
              >
                <p className="font-semibold">
                  Slot {slot.slotNumber.split("-")[1]}-
                  {slot.slotNumber.split("-")[2]}
                </p>
                <p
                  className={`text-sm ${
                    slot.status ? "text-success" : "text-error"
                  }`}
                >
                  {slot.status ? "Available" : "Occupied"}
                </p>
              </button>
            ))}
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
                  value={new Date(newBooking.date).toISOString().slice(0, 10)}
                  onChange={(e) =>
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
                  value={new Date(newBooking.startTime)
                    .toISOString()
                    .substring(11, 16)}
                  onChange={(e) => {
                    const selectedStartTime = new Date(e.target.value);
                    setNewBooking({
                      ...newBooking,
                      startTime: selectedStartTime,
                    });
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
                  value={
                    ((newBooking.slots * 1) / 2) *
                    (parkingArea?.hourlyRate || 0)
                  }
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      totalAmount: Number(e.target.value),
                    })
                  }
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
