'use client';

import { useEffect, useState } from 'react';

interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  stars: number;
  status: string;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_on: string | null;
}

export default function HotelListPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels`);
        if (!res.ok) throw new Error('Failed to fetch hotels');
        
        const json = await res.json();
        const data: Hotel[] = json.data || []; // Adjust if your API returns data differently
        
        setHotels(data);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Hotel List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading hotels...</div>
      ) : hotels.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No hotels found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              <h2 className="text-2xl font-semibold text-indigo-600">{hotel.name}</h2>
              <p className="text-md text-gray-500">{hotel.address}</p>
              <p className="text-gray-700 mt-4">{hotel.description}</p>
              <p className="text-gray-600 mt-2">Stars: {hotel.stars}</p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={hotel.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {hotel.status}
                  </span>
                </div>
                {hotel.deleted_on && (
                  <div className="text-red-500">
                    <span className="font-medium">Deleted On:</span>{' '}
                    {new Date(hotel.deleted_on).toLocaleDateString()}
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
