"use client";
import { useState } from 'react';

interface FormData {
  name: string;
  address: string;
  coordinate: {
    lat: string;
    lng: string;
  };
  description: string;
  stars: number;
  working_time: string;
  status: string;
}

export default function HotelForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    coordinate: { lat: '', lng: '' },
    description: '',
    stars: 1,
    working_time: '',
    status: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'lat' || name === 'lng') {
      setFormData((prevData) => ({
        ...prevData,
        coordinate: {
          ...prevData.coordinate,
          [name]: value,
        },
      }));
    } else if (name === 'stars') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      coordinate: `${formData.coordinate.lat},${formData.coordinate.lng}`, // stringify
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Hotel successfully added!');
      } else {
        throw new Error('Failed to add hotel');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error adding the hotel.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md space-y-3">
      <div>
        <label className="block text-sm text-gray-700" htmlFor="name">Hotel Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700" htmlFor="address">Address</label>
        <input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Latitude</label>
        <input
          type="text"
          name="lat"
          value={formData.coordinate.lat}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Longitude</label>
        <input
          type="text"
          name="lng"
          value={formData.coordinate.lng}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700" htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700" htmlFor="stars">Stars</label>
        <input
          type="number"
          name="stars"
          id="stars"
          value={formData.stars}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          min={1}
          max={5}
          step={1}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700" htmlFor="working_time">Working Time</label>
        <input
          type="text"
          name="working_time"
          id="working_time"
          value={formData.working_time}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700" htmlFor="status">Status</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          required
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
}
