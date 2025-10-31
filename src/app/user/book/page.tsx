"use client";
import Title from "@/components/Title";
import { ParkingArea } from "@/Types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BookSlotPage() {
  const [searchParams, setSearchParams] = useState({
    name: "",
    taluka: "",
    district: "",
    state: "",
  });
  const [talukas, setTalukas] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const fetchAreas = async () => {
    try {
      const response = await fetch("/api/areas");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAreas(data.areas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };
  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    const uniqueTalukas = Array.from(
      new Set(areas.map((area) => area.address.taluka))
    );
    setTalukas(uniqueTalukas);
    const uniqueDistricts = Array.from(
      new Set(areas.map((area) => area.address.district))
    );
    setDistricts(uniqueDistricts);
    const uniqueStates = Array.from(
      new Set(areas.map((area) => area.address.state))
    );
    setStates(uniqueStates);
  }, [areas]);
  const filteredAreas = areas.filter((area) => {
    const matchesName =
      searchParams.name === "" ||
      area.name.toLowerCase().includes(searchParams.name.toLowerCase());
    const matchesTaluka =
      searchParams.taluka === "" || area.address.taluka === searchParams.taluka;
    const matchesDistrict =
      searchParams.district === "" ||
      area.address.district === searchParams.district;
    const matchesState =
      searchParams.state === "" || area.address.state === searchParams.state;
    return matchesName && matchesTaluka && matchesDistrict && matchesState;
  });
  return (
    <>
      <Title
        title="Book a Slot"
        subtitle="Select a parking area and choose a slot."
      />
      <div className="flex flex-row gap-6">
        <input
          type="text"
          name="search"
          className="input input-primary w-full"
          placeholder="Search Areas by Name, Taluka, District, State"
          value={searchParams.name}
          onChange={(e) => {
            setSearchParams({ ...searchParams, name: e.target.value });
          }}
        />
        <select
          name="taluka"
          className="select select-primary w-full capitalize"
          value={searchParams.taluka}
          onChange={(e) => {
            setSearchParams({ ...searchParams, taluka: e.target.value });
          }}
        >
          <option value="">Select Taluka</option>
          {talukas.map((taluka) => (
            <option key={taluka} value={taluka}>
              {taluka}
            </option>
          ))}
        </select>
        <select
          name="district"
          className="select select-primary w-full capitalize"
          value={searchParams.district}
          onChange={(e) => {
            setSearchParams({ ...searchParams, district: e.target.value });
          }}
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <select
          name="state"
          className="select select-primary w-full capitalize"
          value={searchParams.state}
          onChange={(e) => {
            setSearchParams({ ...searchParams, state: e.target.value });
          }}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {filteredAreas && filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {filteredAreas.map((area) => (
            <div
              key={area._id}
              className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <figure>
                {area.displayImage && (
                  <img
                    src={area.displayImage}
                    alt={area.name}
                    className="w-full h-64 object-cover"
                  />
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title text-lg">{area.name}</h2>
                <p className="text-sm text-base-content/60">
                  {area.address.street}, {area.address.village},{" "}
                  {area.address.state}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">
                    <span className="block">
                      Slots: {area.availableSlots} / {area.totalSlots}
                    </span>
                    <span className="block">
                      Rate: ₹{area.hourlyRate} per hour
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Link
                      href={`https://www.google.com/maps?q=${area.latitude},${area.longitude}`}
                      key={area._id}
                      className="btn btn-primary btn-outline btn-sm"
                      target="_blank"
                    >
                      Location
                    </Link>
                    <Link
                      href={`/user/slots?id=${area._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xl text-center mt-6">No areas found</p>
      )}
    </>
  );
}
