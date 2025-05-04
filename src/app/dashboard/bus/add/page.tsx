'use client';

import { useState, useEffect } from 'react';

interface Agency {
  id: number;
  name: string;
}

interface SeatType {
  id: number;
  name: string;
}

export default function AddBusPage() {
  const [name, setName] = useState('');
  const [seatTypeId, setSeatTypeId] = useState('');
  const [numberOfSeat, setNumberOfSeat] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [status, setStatus] = useState('active');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agRes, seatRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies/names`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seat-types/names`)
        ]);

        const agJson = await agRes.json();
        const seatJson = await seatRes.json();

        setAgencies(agJson || []);
        setSeatTypes(seatJson || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          seat_type: seatTypeId,
          number_of_seat: parseInt(numberOfSeat),
          agency_id: parseInt(agencyId),
          status,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      alert("Bus successfully added!");

      // Reset form
      setName('');
      setSeatTypeId('');
      setNumberOfSeat('');
      setAgencyId('');
      setStatus('active');
    } catch (err) {
      console.error("Failed to submit:", err);
      alert("There was an error submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Add New Bus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bus Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Seat Type</label>
          <select
            value={seatTypeId}
            onChange={(e) => setSeatTypeId(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="">Select a seat type</option>
            {seatTypes.map((seat) => (
              <option key={seat.id} value={seat.id}>
                {seat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
          <input
            type="number"
            value={numberOfSeat}
            onChange={(e) => setNumberOfSeat(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Agency</label>
          <select
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="">Select an agency</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
