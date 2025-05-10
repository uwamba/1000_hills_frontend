'use client';

import { useState, useEffect } from 'react';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    from_date_time: '',
    to_date_time: '',
    object_type: 'Bus', // kept for backend compatibility
  });

  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    // Example locations (replace with API call if needed)
    setLocations(['Kigali', 'Kampala', 'Daresalam', 'Kabare']);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Booking failed');
      const data = await response.json();
      alert('Booking created successfully');
      console.log(data);
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">From Where</label>
          <select
            name="from_location"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">Select departure</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">To Where</label>
          <select
            name="to_location"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">Select destination</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">From Date & Time</label>
          <input
            type="datetime-local"
            name="from_date_time"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">To Date & Time</label>
          <input
            type="datetime-local"
            name="to_date_time"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
}
