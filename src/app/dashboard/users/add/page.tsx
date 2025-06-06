"use client";
import { useState, useEffect } from "react";

interface AdminFormData {
  names: string;
  email: string;
  address: string;
  phone: string;
  password: string;
  role: string;
  object_id: string;   // Selected object's ID
  object: string; // hotel, apartment, or agence
  is_active: string;   // "1" or "0"
}

export default function AdminRegistrationForm() {
  const [formData, setFormData] = useState<AdminFormData>({
    names: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    role: "",
    object_id: "",
    object: "",
    is_active: "1",
  });

  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [apartments, setApartments] = useState<{ id: string; name: string }[]>([]);
  const [agences, setAgences] = useState<{ id: string; name: string }[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");

        const [hotelsRes, apartmentsRes, agencesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels/names`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments/names`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies/names`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        if (hotelsRes.ok) {
          const data = await hotelsRes.json();
          setHotels(data);
        }
        if (apartmentsRes.ok) {
          const data = await apartmentsRes.json();
          setApartments(data);
        }
        if (agencesRes.ok) {
          const data = await agencesRes.json();
          setAgences(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle object selection separately
  const handleObjectSelection = (type: string, id: string) => {
    setFormData((prevData) => ({
      ...prevData,
      object: type,
      object_id: id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authToken = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        is_active: formData.is_active === "1",
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Admin successfully registered!");
        setFormData({
          names: "",
          email: "",
          address: "",
          phone: "",
          password: "",
          role: "",
          object_id: "",
          object: "",
          is_active: "1",
        });
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to register admin");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error registering the admin.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6 text-black"
    >
      <h2 className="text-2xl font-bold mb-4">Register New Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Full Names</label>
          <input
            type="text"
            name="names"
            value={formData.names}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        {/* Object selectors */}
       {/* Object Type Selector */}
<div>
  <label className="block text-sm font-semibold">Object Type</label>
  <select
    name="object"
    value={formData.object}
    onChange={(e) =>
      setFormData((prevData) => ({
        ...prevData,
        object: e.target.value,
        object_id: "", // Reset object ID when type changes
      }))
    }
    className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
    required
  >
    <option value="">Select Object Type</option>
    <option value="hotel">Hotel</option>
    <option value="agence">Agence</option>
    <option value="apartment">Apartment</option>
  </select>
</div>

{/* Conditionally render object selector based on object_type */}
{formData.object === "hotel" && (
  <div>
    <label className="block text-sm font-semibold">Hotel to Manage</label>
    <select
      name="hotel_id"
      value={formData.object_id}
      onChange={(e) => handleObjectSelection("hotel", e.target.value)}
      className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
      required
    >
      <option value="">Select Hotel</option>
      {hotels.map((hotel) => (
        <option key={hotel.id} value={hotel.id}>
          {hotel.name}
        </option>
      ))}
    </select>
  </div>
)}

{formData.object === "agence" && (
  <div>
    <label className="block text-sm font-semibold">Agence to Manage</label>
    <select
      name="agence_id"
      value={formData.object_id}
      onChange={(e) => handleObjectSelection("agence", e.target.value)}
      className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
      required
    >
      <option value="">Select Agence</option>
      {agences.map((agence) => (
        <option key={agence.id} value={agence.id}>
          {agence.name}
        </option>
      ))}
    </select>
  </div>
)}

{formData.object === "apartment" && (
  <div>
    <label className="block text-sm font-semibold">Apartment to Manage</label>
    <select
      name="apartment_id"
      value={formData.object_id}
      onChange={(e) => handleObjectSelection("apartment", e.target.value)}
      className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
      required
    >
      <option value="">Select Apartment</option>
      {apartments.map((apartment) => (
        <option key={apartment.id} value={apartment.id}>
          {apartment.name}
        </option>
      ))}
    </select>
  </div>
)}


        <div className="md:col-span-2">
          <label className="block text-sm font-semibold">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Active Status</label>
          <select
            name="is_active"
            value={formData.is_active}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-700 rounded hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        >
          Register Admin
        </button>
      </div>
    </form>
  );
}
