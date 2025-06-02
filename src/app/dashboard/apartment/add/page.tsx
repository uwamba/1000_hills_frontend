"use client";

import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const defaultApartmentData = {
  name: "",
  number_of_bedroom: 1,
  kitchen_inside: false,
  kitchen_outside: false,
  number_of_floor: 1,
  address: "",
  coordinate: { lat: "", lng: "" },
  annexes: "",
  description: "",
  status: "",
  swimming_pool: false,
  laundry: false,
  gym: false,
  room_service: false,
  sauna_massage: false,
  price_per_night: "",
  monthly_price: "",
};

export default function ApartmentFormPage() {
  const [formData, setFormData] = useState(defaultApartmentData);
  const [photos, setPhotos] = useState<File[]>([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = {
    lat: parseFloat(formData.coordinate.lat) || -1.9441,
    lng: parseFloat(formData.coordinate.lng) || 30.0619,
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "lat" || name === "lng") {
      setFormData((prev) => ({
        ...prev,
        coordinate: { ...prev.coordinate, [name]: value },
      }));
    } else if (type === "checkbox") {
      // Use type assertion to safely access `checked`
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === "number_of_bedroom" || name === "number_of_floor") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = e.target.files[0];
      setPhotos(newPhotos);
    }
  };

  const addPhotoField = () => {
    setPhotos([...photos, new File([], "")]);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat().toString() ?? "";
    const lng = e.latLng?.lng().toString() ?? "";
    if (lat && lng) {
      setFormData((prev) => ({
        ...prev,
        coordinate: { lat, lng },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("address", formData.address);
    formPayload.append("description", formData.description);
    formPayload.append("number_of_bedroom", formData.number_of_bedroom.toString());
    formPayload.append("kitchen_inside", formData.kitchen_inside ? "1" : "0");
    formPayload.append("kitchen_outside", formData.kitchen_outside ? "1" : "0");
    formPayload.append("number_of_floor", formData.number_of_floor.toString());
    formPayload.append("status", formData.status);
    formPayload.append("coordinate", `${formData.coordinate.lat},${formData.coordinate.lng}`);
    formPayload.append("annexes", formData.annexes);
    formPayload.append("swimming_pool", formData.swimming_pool ? "1" : "0");
    formPayload.append("laundry", formData.laundry ? "1" : "0");
    formPayload.append("gym", formData.gym ? "1" : "0");
    formPayload.append("room_service", formData.room_service ? "1" : "0");
    formPayload.append("sauna_massage", formData.sauna_massage ? "1" : "0");
    formPayload.append("price_per_night", formData.price_per_night);
    formPayload.append("monthly_price", formData.monthly_price);

    photos.forEach((photo) => {
      if (photo instanceof File && photo.size > 0) {
        formPayload.append("photos[]", photo);
      }
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments`,
        {
          method: "POST",
          body: formPayload,
        }
      );

      if (response.ok) {
        alert("Apartment successfully added!");
        setFormData(defaultApartmentData);
        setPhotos([]);
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        alert("Failed to add apartment.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error adding the apartment.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Add New Apartment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Apartment Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Latitude</label>
          <input
            type="text"
            name="lat"
            value={formData.coordinate.lat}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Longitude</label>
          <input
            type="text"
            name="lng"
            value={formData.coordinate.lng}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Price Per Night</label>
          <input
            type="text"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            placeholder="Enter price per night"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Monthly Price</label>
          <input
            type="text"
            name="monthly_price"
            value={formData.monthly_price}
            onChange={handleChange}
            placeholder="Enter monthly price"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Number of Bedrooms</label>
          <input
            type="number"
            name="number_of_bedroom"
            value={formData.number_of_bedroom}
            onChange={handleChange}
            min={1}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Number of Floors</label>
          <input
            type="number"
            name="number_of_floor"
            value={formData.number_of_floor}
            onChange={handleChange}
            min={1}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="kitchen_inside"
            checked={formData.kitchen_inside}
            onChange={handleChange}
          />
          <label className="text-gray-900">Kitchen Inside</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="kitchen_outside"
            checked={formData.kitchen_outside}
            onChange={handleChange}
          />
          <label className="text-gray-900">Kitchen Outside</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Annexes</label>
          <input
            type="text"
            name="annexes"
            value={formData.annexes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {[
            { label: "Swimming Pool", name: "swimming_pool" },
            { label: "Laundry", name: "laundry" },
            { label: "Gym", name: "gym" },
            { label: "Room Service", name: "room_service" },
            { label: "Sauna Massage", name: "sauna_massage" },
          ].map((service) => (
            <div key={service.name} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={service.name}
                checked={
                  formData[service.name as keyof typeof defaultApartmentData] as boolean
                }
                onChange={handleChange}
              />
              <label className="text-gray-900">{service.label}</label>
            </div>
          ))}
        </div>
      </div>

      {isLoaded && (
        <div className="h-64 mt-4">
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerClassName="w-full h-full rounded"
            onClick={handleMapClick}
          >
            <Marker position={center} />
          </GoogleMap>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Photos</label>
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
          Submit Apartment
        </button>
      </div>
    </form>
  );
}
