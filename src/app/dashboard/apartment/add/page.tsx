'use client';

import { useState, useEffect, ChangeEvent } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface OwnerOption {
  id: number;
  name: string;
}

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
  contract: "", // we handle file separately
  apartment_owner_id: "", // new field: store as string, convert to int on submit
};

export default function ApartmentFormPage() {
  const [formData, setFormData] = useState<typeof defaultApartmentData>({
    ...defaultApartmentData,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [loadingOwners, setLoadingOwners] = useState<boolean>(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = {
    lat: parseFloat(formData.coordinate.lat) || -1.9441,
    lng: parseFloat(formData.coordinate.lng) || 30.0619,
  };

  // Fetch owners on mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartment-owners/names`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          console.error("Failed to fetch owners:", res.statusText);
          setOwners([]);
        } else {
          const data: OwnerOption[] = await res.json();
          setOwners(data);
        }
      } catch (err) {
        console.error("Error fetching owners:", err);
        setOwners([]);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
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
    } else if (name === "apartment_owner_id") {
      // store as string; backend expects integer, convert later
      setFormData((prev) => ({
        ...prev,
        apartment_owner_id: value,
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

    // Basic validation: ensure owner selected
    if (!formData.apartment_owner_id) {
      alert("Please select an apartment owner.");
      return;
    }
    // Build FormData
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("address", formData.address);
    formPayload.append("description", formData.description);
    formPayload.append(
      "number_of_bedroom",
      formData.number_of_bedroom.toString()
    );
    formPayload.append(
      "kitchen_inside",
      formData.kitchen_inside ? "1" : "0"
    );
    formPayload.append(
      "kitchen_outside",
      formData.kitchen_outside ? "1" : "0"
    );
    formPayload.append(
      "number_of_floor",
      formData.number_of_floor.toString()
    );
    formPayload.append("status", formData.status);
    formPayload.append(
      "coordinate",
      `${formData.coordinate.lat},${formData.coordinate.lng}`
    );
    formPayload.append("annexes", formData.annexes);
    formPayload.append(
      "swimming_pool",
      formData.swimming_pool ? "1" : "0"
    );
    formPayload.append("laundry", formData.laundry ? "1" : "0");
    formPayload.append("gym", formData.gym ? "1" : "0");
    formPayload.append(
      "room_service",
      formData.room_service ? "1" : "0"
    );
    formPayload.append(
      "sauna_massage",
      formData.sauna_massage ? "1" : "0"
    );
    formPayload.append("price_per_night", formData.price_per_night);
    formPayload.append("monthly_price", formData.monthly_price);
    // Append the owner ID (convert to integer string if needed)
    formPayload.append(
      "apartment_owner_id",
      formData.apartment_owner_id
    );
    // Append contract file if chosen
    if (contractFile) {
      formPayload.append("contract", contractFile);
    }
    // Append photos
    photos.forEach((photo) => {
      if (photo instanceof File && photo.size > 0) {
        formPayload.append("photos[]", photo);
      }
    });

    try {
      const authToken = localStorage.getItem("authToken") || "";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formPayload,
        }
      );

      if (response.ok) {
        alert("Apartment successfully added!");
        setFormData(defaultApartmentData);
        setPhotos([]);
        setContractFile(null);
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
      className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded space-y-6 text-gray-900"
    >
      <h2 className="text-2xl font-bold">Add New Apartment</h2>

      {/* Owner Select */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Apartment Owner
        </label>
        {loadingOwners ? (
          <p>Loading owners...</p>
        ) : (
          <select
            name="apartment_owner_id"
            value={formData.apartment_owner_id}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id.toString()}>
                {owner.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Apartment Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Apartment Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Price Per Night */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Price Per Night
          </label>
          <input
            type="text"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Monthly Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Monthly Price
          </label>
          <input
            type="text"
            name="monthly_price"
            value={formData.monthly_price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Bedrooms
          </label>
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

        {/* Floors */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Floors
          </label>
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

        {/* Kitchen Inside */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="kitchen_inside"
            checked={formData.kitchen_inside}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label>Kitchen Inside</label>
        </div>

        {/* Kitchen Outside */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="kitchen_outside"
            checked={formData.kitchen_outside}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label>Kitchen Outside</label>
        </div>

        {/* Annexes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Annexes
          </label>
          <input
            type="text"
            name="annexes"
            value={formData.annexes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Status
          </label>
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

        {/* Amenities */}
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
                  formData[
                    service.name as keyof typeof defaultApartmentData
                  ] as boolean
                }
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label>{service.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium mb-1">Photos</label>
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

      {/* Map toggle */}
      <div>
        <button
          type="button"
          onClick={() => setIsMapOpen(!isMapOpen)}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
        >
          {isMapOpen ? "Close Map" : "Set Location on Map"}
        </button>
      </div>

      {/* Map */}
      {isLoaded && isMapOpen && (
        <div className="h-64 mt-4 border rounded overflow-hidden">
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerClassName="w-full h-full"
            onClick={handleMapClick}
          >
            <Marker position={center} />
          </GoogleMap>
        </div>
      )}

      {/* Contract File Upload */}
      <div>
        <label htmlFor="contract" className="block text-sm font-medium text-gray-700">
          Contract File (PDF/DOC)
        </label>
        <input
          type="file"
          name="contract"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="w-full py-3 px-4 text-center font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Submit Apartment
        </button>
      </div>
    </form>
  );
}
