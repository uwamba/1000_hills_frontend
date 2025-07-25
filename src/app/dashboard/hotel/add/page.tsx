"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface FormDataType {
  name: string;
  address: string;
  coordinate: {
    lat: string;
    lng: string;
  };
  description: string;
  contract: File | null;
  stars: number;
  working_time: string;
  status: string;
}

export default function HotelForm() {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    address: "",
    coordinate: { lat: "", lng: "" },
    description: "",
    contract: null,
    stars: 1,
    working_time: "",
    status: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [authToken, setAuthToken] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  const isBrowser = typeof window !== "undefined";

  const { isLoaded } = isBrowser
    ? useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["maps"],
      })
    : { isLoaded: false };

  useEffect(() => {
    if (isBrowser) {
      const token = localStorage.getItem("authToken");
      if (token) setAuthToken(token);
    }
  }, [isBrowser]);

  const center = {
    lat: parseFloat(formData.coordinate.lat) || -1.9441,
    lng: parseFloat(formData.coordinate.lng) || 30.0619,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        contract: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("address", formData.address);
    formPayload.append("description", formData.description);
    if (formData.contract) formPayload.append("contract", formData.contract);
    formPayload.append("stars", formData.stars.toString());
    formPayload.append("working_time", formData.working_time);
    formPayload.append("status", formData.status);
    formPayload.append(
      "coordinate",
      `${formData.coordinate.lat},${formData.coordinate.lng}`
    );
    photos.forEach((photo) => {
      if (photo instanceof File && photo.size > 0) {
        formPayload.append("photos[]", photo);
      }
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formPayload,
        }
      );

      if (response.ok) {
        alert("Hotel successfully added!");
        setFormData({
          name: "",
          address: "",
          coordinate: { lat: "", lng: "" },
          description: "",
          contract: null,
          stars: 1,
          working_time: "",
          status: "",
        });
        setPhotos([]);
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        alert("Failed to add hotel.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error adding the hotel.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "stars") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = e.target.files[0];
      setPhotos(newPhotos);
    }
  };

  const addPhotoField = () => {
    const placeholderFile = new File([""], "placeholder.jpg", {
      type: "image/jpeg",
    });
    setPhotos([...photos, placeholderFile]);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat().toString() ?? "";
    const lng = e.latLng?.lng().toString() ?? "";
    if (lat && lng) {
      setFormData((prev) => ({
        ...prev,
        coordinate: { lat, lng },
      }));
      setShowMap(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Add New Hotel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Hotel Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Stars
          </label>
          <select
            name="stars"
            value={formData.stars}
            onChange={handleChange}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          >
            {[1, 2, 3, 4, 5].map((val) => (
              <option key={val} value={val}>
                {val} Star{val > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Working Time
          </label>
          <input
            type="text"
            name="working_time"
            value={formData.working_time}
            onChange={handleChange}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="contrast-input w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Contract Document
          </label>
          <input
            type="file"
            name="contract"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Location
          </label>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Select Location on Map
          </button>
          {formData.coordinate.lat && formData.coordinate.lng && (
            <p className="mt-2 text-sm text-gray-700">
              Selected Coordinates: ({formData.coordinate.lat},{" "}
              {formData.coordinate.lng})
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Photos
        </label>
        <div className="space-y-2">
          {photos.map((_, index) => (
            <input
              key={index}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(index, e)}
              className="block w-full text-sm border border-gray-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addPhotoField}
          className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          + Add Another Photo
        </button>
      </div>

      <div>
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-700 rounded hover:bg-blue-800"
        >
          Submit Hotel
        </button>
      </div>

      {showMap && isLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-2xl h-[500px] relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowMap(false)}
            >
              Close
            </button>
            <GoogleMap
              center={center}
              zoom={15}
              mapContainerClassName="w-full h-full rounded"
              onClick={handleMapClick}
            >
              {formData.coordinate.lat && formData.coordinate.lng && (
                <Marker
                  position={{
                    lat: parseFloat(formData.coordinate.lat),
                    lng: parseFloat(formData.coordinate.lng),
                  }}
                />
              )}
            </GoogleMap>
          </div>
        </div>
      )}

      <style jsx>{`
        .contrast-input {
          color: #000 !important;
          border-color: #333 !important;
        }
      `}</style>
    </form>
  );
}
