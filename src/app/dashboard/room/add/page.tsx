"use client";
import { useState, useEffect } from "react";

interface Hotel {
  id: number;
  name: string;
}

interface FormDataType {
  name: string;
  type: string;
  has_wireless: boolean;
  bed_size: string;
  has_bathroom: boolean;
  price: number;
  currency: string;
  number_of_people: number;
  has_ac: boolean;
  hotel_id: number | string;
  status: string;
  has_swimming_pool: boolean;
  has_laundry: boolean;
  has_gym: boolean;
  has_room_service: boolean;
  has_sauna_massage: boolean;
  has_kitchen: boolean;
  has_fridge: boolean;
}

export default function RoomForm() {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    type: "",
    has_wireless: false,
    bed_size: "",
    has_bathroom: false,
    price: 0,
    currency: "",
    number_of_people: 0,
    has_ac: false,
    hotel_id: "",
    status: "",
    has_swimming_pool: false,
    has_laundry: false,
    has_gym: false,
    has_room_service: false,
    has_sauna_massage: false,
    has_kitchen: false,
    has_fridge: false,
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels/names`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch hotel names");
        }
        const data = await response.json();
        setHotels(data);
      } catch (error) {
        console.error("Failed to fetch hotel names:", error);
      }
    };

    if (authToken) {
      fetchHotels();
    } else {
      console.warn("No authToken found in localStorage.");
    }
  }, [authToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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
    setPhotos([...photos, new File([], "")]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formPayload.append(key, value ? "1" : "0");
      } else {
        formPayload.append(key, value.toString());
      }
    });

    photos.forEach((photo) => {
      if (photo instanceof File && photo.size > 0) {
        formPayload.append("photos[]", photo);
      }
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formPayload,
        }
      );

      if (response.ok) {
        alert("Room successfully added!");
        setFormData({
          name: "",
          type: "",
          has_wireless: false,
          bed_size: "",
          has_bathroom: false,
          price: 0,
          currency: "",
          number_of_people: 0,
          has_ac: false,
          hotel_id: "",
          status: "",
          has_swimming_pool: false,
          has_laundry: false,
          has_gym: false,
          has_room_service: false,
          has_sauna_massage: false,
          has_kitchen: false,
          has_fridge: false,
        });
        setPhotos([]);
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        alert("Failed to add room. Server error.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error adding the room.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6 text-gray-800"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Room</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Room Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Room Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Room Type</option>
            <option value="Single Room">Single Room</option>
            <option value="Double">Double</option>
            <option value="Twin Room">Twin Room</option>
            <option value="Triple Room">Triple Room</option>
            <option value="King Room">King Room</option>
            <option value="Suite">Suite</option>
            <option value="Executive Room">Executive Room</option>
            <option value="Presidential Suite">Presidential Suite</option>
          </select>
        </div>

        {/* Bed Size */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Bed Size
          </label>
          <input
            type="text"
            name="bed_size"
            value={formData.bed_size}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Currency</option>
            <option value="FRW">FRW</option>
            <option value="USD">USD</option>
          </select>
        </div>

        {/* Number of People */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Number of People
          </label>
          <input
            type="number"
            name="number_of_people"
            value={formData.number_of_people}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Hotel */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Hotel
          </label>
          <select
            name="hotel_id"
            value={formData.hotel_id}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a hotel</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Checkboxes */}
        {[
          { name: "has_wireless", label: "Has Wireless" },
          { name: "has_bathroom", label: "Has Bathroom" },
          { name: "has_ac", label: "Has AC" },
          { name: "has_swimming_pool", label: "Swimming Pool" },
          { name: "has_laundry", label: "Laundry Service" },
          { name: "has_gym", label: "Gym" },
          { name: "has_room_service", label: "Room Service" },
          { name: "has_sauna_massage", label: "Sauna & Massage" },
          { name: "has_kitchen", label: "Kitchen" },
          { name: "has_fridge", label: "Fridge" },
        ].map(({ name, label }) => (
          <div key={name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={name}
              checked={formData[name as keyof FormDataType] as boolean}
              onChange={handleChange}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-800">{label}</label>
          </div>
        ))}
      </div>

      {/* Photos */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Photos
        </label>
        <div className="space-y-2">
          {photos.map((_, index) => (
            <input
              key={index}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(index, e)}
              className="block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:border-gray-400 file:bg-gray-50 file:text-gray-800"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addPhotoField}
          className="mt-2 text-sm text-blue-700 hover:text-blue-900 underline"
        >
          Add another photo
        </button>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-800"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
