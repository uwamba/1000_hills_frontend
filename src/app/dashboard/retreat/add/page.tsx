"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface RetreatFormData {
  title: string;
  description: string;
  address: string;
  capacity: number;
  status: string;
  type: string;
  wifi: boolean;
  projector: boolean;
  theater: boolean;
  flipChart: boolean;
  whiteboard: boolean;
  pricingType: "individual" | "package";
  pricePerPerson?: number;
  packagePrice?: number;
  packageSize?: number;
}

export default function AddRetreatPage() {
  const [formData, setFormData] = useState<RetreatFormData>({
    title: "",
    description: "",
    address: "",
    capacity: 1,
    status: "",
    type: "",
    wifi: false,
    projector: false,
    theater: false,
    flipChart: false,
    whiteboard: false,
    pricingType: "individual",
    pricePerPerson: undefined,
    packagePrice: undefined,
    packageSize: undefined,

  });

  const [photos, setPhoto] = useState<(File | null)[]>([null]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (["capacity", "pricePerPerson", "packagePrice", "packageSize"].includes(name)) {
        return {
          ...prev,
          [name]: value === "" ? undefined : Number(value),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };


  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = e.target.files[0];
      setPhoto(newPhotos);
    }
  };

  const addPhotoField = () => {
    setPhoto((prev) => [...prev, null]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
  
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("address", formData.address);
      formDataPayload.append("capacity", formData.capacity.toString());
      formDataPayload.append("status", formData.status);
      formDataPayload.append("type", formData.type);
      formDataPayload.append("object_type", "retreat");
  
      formDataPayload.append("wifi", formData.wifi ? "1" : "0");
      formDataPayload.append("projector", formData.projector ? "1" : "0");
      formDataPayload.append("theater", formData.theater ? "1" : "0");
      formDataPayload.append("flip_chart", formData.flipChart ? "1" : "0");
      formDataPayload.append("whiteboard", formData.whiteboard ? "1" : "0");
  
      formDataPayload.append("pricing_type", formData.pricingType);
      if (formData.pricingType === "individual" && formData.pricePerPerson !== undefined) {
        formDataPayload.append("price_per_person", formData.pricePerPerson.toString());
      } else if (
        formData.pricingType === "package" &&
        formData.packagePrice !== undefined &&
        formData.packageSize !== undefined
      ) {
        formDataPayload.append("package_price", formData.packagePrice.toString());
        formDataPayload.append("package_size", formData.packageSize.toString());
      }
  
      photos.forEach((photo) => {
        if (photo instanceof File) {
          formDataPayload.append("photos[]", photo);
        }
      });
   const authToken = localStorage.getItem("authToken"); 
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`, // Ensure you have the auth token
          // ⚠️ DO NOT manually set Content-Type for FormData
          // 'Content-Type': 'multipart/form-data', // REMOVE THIS LINE if you have it elsewhere
        },
        body: formDataPayload,
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to create retreat");
      }
  
      router.push("/dashboard/retreat/add");
    } catch (error) {
      console.error("Error creating retreat:", error);
      setErrorMessage("❌ Failed to create retreat. Please try again.");
    }
  };
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Add New Retreat</h1>

      {errorMessage && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            >
              <option value="">Select Type</option>
              <option value="Garden">Garden</option>
              <option value="Wedding Place">Wedding Place</option>
              <option value="Meeting Room">Meeting Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Capacity"
              min={1}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "wifi", label: "WiFi" },
            { name: "projector", label: "Projector" },
            { name: "theater", label: "Theater" },
            { name: "flipChart", label: "Flip chart and markers" },
            { name: "whiteboard", label: "Whiteboard" },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={name}
                checked={formData[name as keyof RetreatFormData] as boolean}
                onChange={handleCheckboxChange} // <-- fixed here
                className="form-checkbox"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pricing Type</label>
          <select
            name="pricingType"
            value={formData.pricingType}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          >
            <option value="individual">Individual</option>
            <option value="package">Package</option>
          </select>
        </div>

        {formData.pricingType === "individual" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Per Person</label>
            <input
              type="number"
              name="pricePerPerson"
              value={formData.pricePerPerson ?? ""}
              onChange={handleInputChange}
              min={0}
              step={0.01}
              placeholder="Price per person"
              className="w-full p-2 mt-1 border border-gray-300 rounded"
              required
            />
          </div>
        )}

        {formData.pricingType === "package" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Package Size</label>
              <input
                type="number"
                name="packageSize"
                value={formData.packageSize ?? ""}
                onChange={handleInputChange}
                min={1}
                placeholder="Package size"
                className="w-full p-2 mt-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Package Price</label>
              <input
                type="number"
                name="packagePrice"
                value={formData.packagePrice ?? ""}
                onChange={handleInputChange}
                min={0}
                step={0.01}
                placeholder="Package price"
                className="w-full p-2 mt-1 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            rows={4}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
          {photos.map((photo, i) => (
            <input
              key={i}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(i, e)}
              className="block mb-2"
            />
          ))}
          <button
            type="button"
            onClick={addPhotoField}
            className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add More Photos
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700"
        >
          Create Retreat
        </button>
      </form>
    </div>
  );
}
