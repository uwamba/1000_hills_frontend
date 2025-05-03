'use client';
import { useEffect, useState } from 'react';

interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  stars: number;
  working_time: string;
  status: string;
}

export default function HotelListPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Hotel List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading hotels...</div>
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
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium">⭐ Stars:</span> {hotel.stars} |{' '}
                <span className="font-medium">🕒 Working Time:</span> {hotel.working_time} |{' '}
                <span className={`font-medium ${hotel.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {hotel.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
