"use client";

import {
  IconCloudUpload,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconPencil,
} from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { ParkingArea } from "@/Types";
import Title from "@/components/Title";
import Loading from "@/components/Loading";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function DetailsPage() {
  const [parkingDetails, setParkingDetails] = useState<ParkingArea>();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchParkingArea = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/parking-area/get-parking-area?id=${id}`
      );
      setParkingDetails(res.data.parkingArea);
    } catch (error) {
      console.log("An error occured:", error);
      toast.error("Failed to fetch parking aread details");
    } finally {
      setLoading(false);
    }
  };

  const [position, setPosition] = useState<[number, number]>([
    parkingDetails?.latitude || 20.5937,
    parkingDetails?.longitude || 78.9629,
  ]);
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setParkingDetails((prev) => ({
          ...prev!,
          latitude: lat,
          longitude: lng,
        }));
        map.flyTo([lat, lng], map.getZoom());
      },
    });
    return null;
  };

  const uploadImage = (folderName: string, imageName: string, path: string) => {
    if (!parkingDetails?.name) {
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
          setParkingDetails({
            ...parkingDetails!,
            [path]: data.data.path,
          });
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchParkingArea();
    }
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post("/api/areas/edit-area", {
        area: parkingDetails,
      });
      toast.success("Parking area details updated");
    } catch (error) {
      console.log("Error adding new parking area:", error);
      toast.error("Failed to add new parking area");
    } finally {
      fetchParkingArea();
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      <Title title={`All details about ${parkingDetails?.name}`} />
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
            readOnly={isEditMode}
            value={parkingDetails?.name}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                name:
                  e.target.value.charAt(0).toUpperCase() +
                  e.target.value.slice(1).trim(),
              })
            }
          />
        </fieldset>
        {/* Parking Area Display Image */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Area Display Image
            <span className="text-error">*</span>{" "}
          </legend>
          <div className="join">
            <input
              type="file"
              disabled={parkingDetails?.name ? false : true}
              readOnly={isEditMode}
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
                uploadImage(
                  "Area-Images",
                  parkingDetails?.name!,
                  "displayImage"
                )
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
            readOnly
            disabled
            value={parkingDetails?.contactEmail}
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
            readOnly={isEditMode}
            value={parkingDetails?.contactPhone}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                contactPhone:
                  e.target.value.length <= 10
                    ? e.target.value
                    : parkingDetails?.contactPhone!,
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
            readOnly={isEditMode}
            value={parkingDetails?.staffLoginCredentials?.username || ""}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                staffLoginCredentials: {
                  ...parkingDetails?.staffLoginCredentials,
                  username: e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "_"),
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
              readOnly={isEditMode}
              className="input input-bordered w-full"
              placeholder="Enter the Staff password"
              value={parkingDetails?.staffLoginCredentials?.password || ""}
              onChange={(e) =>
                setParkingDetails({
                  ...parkingDetails!,
                  staffLoginCredentials: {
                    ...parkingDetails?.staffLoginCredentials,
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
            readOnly={isEditMode}
            value={parkingDetails?.address.street}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
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
            readOnly={isEditMode}
            placeholder="Enter the Parking Area village"
            value={parkingDetails?.address.village}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
                  village: e.target.value.replace(/[^A-Za-z\s]/g, ""),
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
            readOnly={isEditMode}
            placeholder="Enter the Parking Area Taluka"
            value={parkingDetails?.address.taluka}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
                  taluka: e.target.value.replace(/[^A-Za-z\s]/g, ""),
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
            readOnly={isEditMode}
            placeholder="Enter the Parking Area District"
            value={parkingDetails?.address.district}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
                  district: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
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
            readOnly={isEditMode}
            className="input input-bordered w-full"
            placeholder="Enter the Parking Area State"
            value={parkingDetails?.address.state}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
                  state: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
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
            readOnly={isEditMode}
            className="input input-bordered w-full"
            placeholder="Enter the Parking Area Pincode"
            value={parkingDetails?.address.pincode}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
                address: {
                  ...parkingDetails?.address!,
                  pincode:
                    e.target.value.length <= 6
                      ? e.target.value
                      : parkingDetails?.address.pincode!,
                },
              })
            }
          />
        </fieldset>
        {/* Total Slots Count */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Parking Area Total Slots Count <span className="text-error">*</span>{" "}
          </legend>
          <input
            type="text"
            readOnly
            className="input input-bordered w-full"
            placeholder="Enter the Parking Area Total Slots Count"
            value={parkingDetails?.totalSlots}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
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
            readOnly={isEditMode}
            className="input input-bordered w-full"
            placeholder="Enter the Parking Area Hourly Rate"
            value={parkingDetails?.hourlyRate}
            onChange={(e) =>
              setParkingDetails({
                ...parkingDetails!,
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
            value={parkingDetails?.latitude}
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
            value={parkingDetails?.longitude}
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
      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-4">
        <button
          className="btn btn-error btn-outline"
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <IconPencil size={16} className="mr-2" />{" "}
          {isEditMode ? "Edit Mode On" : "Edit Mode Off"}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <IconDownload size={16} className="mr-2" />
          Save
        </button>
      </div>
    </>
  );
}
