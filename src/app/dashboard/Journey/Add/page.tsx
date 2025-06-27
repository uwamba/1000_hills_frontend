'use client';

import { useState, useEffect } from 'react';

type Bus = {
  id: number;
  name: string;
};

type Currency = {
  currency_code: string;
  rate_to_usd: string;
};

export default function AddJourneyPage() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    return: '',
    time: '',
    bus_id: '',
    price: '',
    currency: '',
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLocations(['Kigali', 'Kampala', 'Daresalam', 'Kabare']);

    const fetchBuses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/buses`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch buses');
        const json = await res.json();
        setBuses(json.data || []);
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrencies = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exchange-rates`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch currencies');
        const json = await res.json();
        setCurrencies(json);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    fetchBuses();
    fetchCurrencies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg border border-gray-300"
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Add New Journey</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">From</label>
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select departure</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">To</label>
            <select
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select destination</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Bus */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Bus</label>
            <select
              name="bus_id"
              value={formData.bus_id}
              onChange={handleChange}
              required
              disabled={loading}
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Departure */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Departure</label>
            <input
              type="date"
              name="departure"
              value={formData.departure}
              onChange={handleChange}
              required
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Return */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Return (optional)</label>
            <input
              type="date"
              name="return"
              value={formData.return}
              onChange={handleChange}
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>


          {/* Price */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Currency */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-900">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="border border-gray-500 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select currency</option>
              {currencies.map((cur) => (
                <option key={cur.currency_code} value={cur.currency_code}>
                  {cur.currency_code} ({cur.rate_to_usd})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-green-700 text-white font-bold px-4 py-3 rounded hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Journey
        </button>
      </form>
    </div>
  );
}
