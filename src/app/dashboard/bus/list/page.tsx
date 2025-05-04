'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

interface SeatType {
  id: number;
  name: string;
}

interface Agency {
  id: number;
  name: string;
}

interface Bus {
  id: number;
  name: string;
  seat_type: number;
  seat_type_data?: SeatType;
  number_of_seat: number;
  agency_id: number;
  agency?: Agency;
  status: string;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_on: string | null;
  updated_by_user?: User | null;
  deleted_by_user?: User | null;
}

export default function BusListPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/buses`);
        if (!res.ok) throw new Error('Failed to fetch buses');

        const json = await res.json();
        const data: Bus[] = json.data || [];

        setBuses(data);
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Bus List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading buses...</div>
      ) : buses.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No buses found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              <h2 className="text-2xl font-semibold text-indigo-600">{bus.name}</h2>

              <p className="text-md text-gray-700 mt-2">
                <span className="font-medium">Agency:</span> {bus.agency?.name || 'N/A'}
              </p>

              <p className="text-md text-gray-700 mt-1">
                <span className="font-medium">Seat Type:</span> {bus.seat_type_data?.name || 'N/A'}
              </p>

              <p className="text-md text-gray-700 mt-1">
                <span className="font-medium">Seats:</span> {bus.number_of_seat}
              </p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={bus.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {bus.status}
                  </span>
                </div>

                {bus.updated_by_user && (
                  <div>
                    <span className="font-medium">Updated By:</span> {bus.updated_by_user.name}
                  </div>
                )}

                {bus.deleted_by_user && (
                  <div>
                    <span className="font-medium text-red-500">Deleted By:</span>{' '}
                    {bus.deleted_by_user.name}
                  </div>
                )}

                {bus.deleted_on && (
                  <div className="text-red-500">
                    <span className="font-medium">Deleted On:</span>{' '}
                    {new Date(bus.deleted_on).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
