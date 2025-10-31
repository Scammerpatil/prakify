"use client";
import Title from "@/components/Title";
import { ParkingArea } from "@/Types";
import {
  IconCancel,
  IconCloudUpload,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconRestore,
} from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Loading from "@/components/Loading";
import Link from "next/link";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<ParkingArea[]>();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [newArea, setNewArea] = useState<ParkingArea>({
    name: "",
    displayImage: "",
    contactEmail: "",
    contactPhone: "",
    staffLoginCredentials: {
      username: "",
      password: "",
    },
    address: {
      street: "",
      village: "",
      taluka: "",
      district: "",
      state: "",
      pincode: "",
    },
    latitude: 0,
    longitude: 0,
    totalSlots: 0,
    hourlyRate: 0,
  });
  const [position, setPosition] = useState<[number, number]>([
    newArea.latitude || 20.5937,
    newArea.longitude || 78.9629,
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<ParkingArea | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/areas");
      const data = await response.json();
      setAreas(data.areas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = (folderName: string, imageName: string, path: string) => {
    if (!newArea.name) {
      toast.error("Name is required for images");
      return;
    }
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      const imageResponse = axios.postForm("/api/helper/upload-img", {
        file: image,
        name: imageName,
        folderName: folderName,
      });
      console.log(imageResponse);
      toast.promise(imageResponse, {
        loading: "Uploading Image...",
        success: (data: AxiosResponse) => {
          setNewArea({
            ...newArea,
            [path]: data.data.path,
          });
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };
  useEffect(() => {
    fetchAreas();
  }, []);

  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setNewArea((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        map.flyTo([lat, lng], map.getZoom());
      },
    });
    return null;
  };

  const handleAddNewParkingArea = async () => {
    setLoading(true);
    try {
      await axios.post("/api/areas/add-new-area", {
        area: newArea,
      });
      toast.success("New parking area added successfully");
    } catch (error) {
      console.log("Error adding new parking area:", error);
      toast.error("Failed to add new parking area");
    } finally {
      fetchAreas();
      setLoading(false);
    }
  };
  const filteredAreas = areas?.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (loading) return <Loading />;
  return (
    <>
      <Title
        title="Parking Areas"
        subtitle="Add, Edit or Delete parking areas"
      />
      <div className="flex flex-row gap-6">
        <input
          type="text"
          name="search"
          className="input w-full input-primary join-item"
          placeholder="Search Areas..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
        <button
          className="btn btn-primary btn-outline"
          onClick={() => {
            (
              document.getElementById(
                "add-new-parking-area"
              ) as HTMLDialogElement
            ).showModal();
          }}
        >
          Add New Area
        </button>
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
                    <button className="btn btn-primary btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xl text-center mt-6">No areas found</p>
      )}

      {/* Add New Area Form */}
      <dialog
        id="add-new-parking-area"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <Toaster />
        <div className="modal-box max-w-6xl bg-base-100 backdrop-blur-lg">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New Parking Area
          </h3>
          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">
              Parking Area Details
            </h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Parking Area Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area name"
                  value={newArea.name}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      name: e.target.value,
                    })
                  }
                />
              </fieldset>
              {/* Parking Area Display Image */}
              <fieldset className="fieldset mt-2">
                <legend className="fieldset-legend">
                  Area Display Image
                  <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type="file"
                    disabled={newArea.name ? false : true}
                    className="file-input file-input-bordered w-full join-item"
                    accept="image/jpg, image/jpeg, image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={() =>
                      uploadImage("Area-Images", newArea.name, "displayImage")
                    }
                  >
                    <IconCloudUpload size={20} className="mr-2" />
                    Upload
                  </button>
                </div>
              </fieldset>
              {/*Parking Area Contact Email  */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Email <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area email"
                  value={newArea.contactEmail}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      contactEmail: e.target.value.toLowerCase().trim() || "",
                    })
                  }
                />
              </fieldset>
              {/* Parking Area Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area phone"
                  value={newArea.contactPhone}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      contactPhone:
                        e.target.value.length <= 10
                          ? e.target.value
                          : newArea.contactPhone,
                    })
                  }
                />
              </fieldset>
              {/* Staff Login Credentials */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Staff Username <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Staff username"
                  value={newArea.staffLoginCredentials?.username || ""}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      staffLoginCredentials: {
                        ...newArea.staffLoginCredentials,
                        username: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Staff Password <span className="text-error">*</span>{" "}
                </legend>
                <div className="join">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    className="input input-bordered w-full"
                    placeholder="Enter the Staff password"
                    value={newArea.staffLoginCredentials?.password || ""}
                    onChange={(e) =>
                      setNewArea({
                        ...newArea,
                        staffLoginCredentials: {
                          ...newArea.staffLoginCredentials,
                          password: e.target.value,
                        },
                      })
                    }
                  />
                  <button
                    className="btn btn-square btn-primary join-item"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <IconEyeOff className="h-5 w-5" />
                    ) : (
                      <IconEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </fieldset>
              {/* Parking Area Address Details */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Address <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area address"
                  value={newArea.address.street}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        street: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              {/* Village */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Village <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area village"
                  value={newArea.address.village}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        village: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              {/* Taluka */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Taluka <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area Taluka"
                  value={newArea.address.taluka}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        taluka: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              {/* District */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area District <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area District"
                  value={newArea.address.district}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        district: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              {/* State */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area State <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area State"
                  value={newArea.address.state}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        state: e.target.value,
                      },
                    })
                  }
                />
              </fieldset>
              {/* Pincode */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Pincode <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area Pincode"
                  value={newArea.address.pincode}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      address: {
                        ...newArea.address,
                        pincode:
                          e.target.value.length <= 6
                            ? e.target.value
                            : newArea.address.pincode,
                      },
                    })
                  }
                />
              </fieldset>
              {/* Total Slots Count */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Total Slots Count{" "}
                  <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area Total Slots Count"
                  value={newArea.totalSlots}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      totalSlots: Number(e.target.value),
                    })
                  }
                />
              </fieldset>
              {/* Hourly Rate */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Hourly Rate <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area Hourly Rate"
                  value={newArea.hourlyRate}
                  onChange={(e) =>
                    setNewArea({
                      ...newArea,
                      hourlyRate: Number(e.target.value),
                    })
                  }
                />
              </fieldset>
              {/* Latitude */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Latitude <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area latitude"
                  value={newArea.latitude}
                  readOnly
                />
              </fieldset>
              {/* Longitude */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Parking Area Longitude <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Parking Area longitude"
                  value={newArea.longitude}
                  readOnly
                />
              </fieldset>
            </div>
            <MapContainer
              center={position}
              zoom={5}
              scrollWheelZoom={true}
              className="w-full h-52 z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={icon}></Marker>

              <MapEvents />
            </MapContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-4">
              <button
                className="btn btn-error btn-outline"
                onClick={() => window.location.reload()}
              >
                <IconRestore size={16} className="mr-2" />
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddNewParkingArea}
              >
                <IconPlus size={16} className="mr-2" />
                Submit
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  (
                    document.getElementById(
                      "add-new-parking-area"
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
