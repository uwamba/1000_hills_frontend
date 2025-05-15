'use client';

import { useState, useEffect } from 'react';

export default function AddJourneyPage() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    route_id: 1, // Can be made dynamic
    bus_id: '', // Add this
    status: 'active',
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [buses, setBuses] = useState<{ id: number; name: string }[]>([]); // Replace with your actual bus structure

  useEffect(() => {
    // Example static locations
    setLocations(['Kigali', 'Kampala', 'Daresalam', 'Kabare']);

    // Mock fetching buses (replace with API call if needed)
    setBuses([
      { id: 1, name: 'Volcano Express' },
      { id: 2, name: 'Ritco' },
      { id: 3, name: 'Kampala Coach' },
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create journey');
      const data = await response.json();
      alert('Journey created successfully!');
      console.log(data);
    } catch (error) {
      console.error('Error creating journey:', error);
      alert('An error occurred while creating the journey.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded mt-10"
    >
      <h2 className="text-2xl font-bold mb-6">Add New Journey</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">From</label>
          <select
            name="from"
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
          <label className="mb-1 font-medium">To</label>
          <select
            name="to"
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
          <label className="mb-1 font-medium">Bus</label>
          <select
            name="bus_id"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">Select bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Departure</label>
          <input
            type="datetime-local"
            name="departure"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Return</label>
          <input
            type="datetime-local"
            name="return"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Journey
      </button>
    </form>
  );
}
