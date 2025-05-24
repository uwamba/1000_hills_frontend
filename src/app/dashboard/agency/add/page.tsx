"use client";
import { useState } from "react";

interface AgencyFormData {
  name: string;
  address: string;
  description: string;
  status: string;
}

export default function AgencyForm() {
  const [formData, setFormData] = useState<AgencyFormData>({
    name: "",
    address: "",
    description: "",
    status: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Agency successfully added!");
        setFormData({
          name: "",
          address: "",
          description: "",
          status: "",
        });
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to add agency");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error adding the agency.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6 text-black"
    >
      <h2 className="text-2xl font-bold mb-4">Add New Agency</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Agency Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none text-black bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none text-black bg-white"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none text-black bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none text-black bg-white"
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-700 rounded hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        >
          Submit Agency
        </button>
      </div>
    </form>
  );
}
