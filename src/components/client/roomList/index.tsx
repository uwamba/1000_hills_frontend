'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Add this at the top


interface Photo {
  id: number;
  path: string;
}

interface Room {
  id: number;
  name: string;
  price: number;
  type: string;
  capacity: number;
  description: string;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
  hotel:Hotel | null;
}

interface RoomResponse {
  current_page: number;
  last_page: number;
  data: Room[];
}
interface Hotel{
  id: number;
  name: string;
  stars: string;

}

export default function RoomListClientPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Authentication required. Please log in.');
    } else {
      setAuthToken(token);
    }
  }, []);

  const fetchRooms = async (page: number) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
        ...(minPrice && { min_price: minPrice }),
        ...(maxPrice && { max_price: maxPrice }),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/rooms?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error('Failed to fetch rooms');

      const json: RoomResponse = await res.json();
      setRooms(json.data);
      setFilteredRooms(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (authToken) fetchRooms(page);
  }, [authToken, page]);

  useEffect(() => {
    if (authToken) {
      fetchRooms(page);
    }
  }, [authToken, page, fromDate, toDate, minPrice, maxPrice]);


  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < lastPage) setPage(page + 1);
  };
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Room List</h1>

      {/* Filters Container */}
      <div className="bg-blue-600 p-6 mb-6 rounded-lg shadow-lg">
        <h2 className="text-white text-2xl font-bold mb-4">Filter Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by name */}

          {/* From Date */}
          <div>
            <label className="block text-white mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-white mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-white mb-2">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-white mb-2">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => fetchRooms(1)}
          >
            Apply Filters
          </button>


        </div>
      </div>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No rooms found.</div>
      ) : (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                href={{ pathname: '/roomList/more', query: { roomId: room.id } }}
                className="block bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={
                      room.photos.length > 0
                        ? `${imageBaseUrl}/${room.photos[0].path}`
                        : '/placeholder.jpg'
                    }
                    alt={room.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-semibold text-indigo-600">{room.name}</h2>
                <p className="text-gray-700 mt-2">{room.description}</p>
                <p className="text-gray-600 mt-1">Price: ${room.price}</p>
                <p className="text-gray-600 mt-1">Hotel: {room.hotel?.name}</p>

                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    <span className= 'text-green-600'>
                      {room.type || 'N/A'}
                    </span>
                  </div>
                  {room.deleted_on && (
                    <div className="text-red-500">
                      <span className="font-medium">Deleted On:</span>{' '}
                      {new Date(room.deleted_on).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>


          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {lastPage}
            </span>
            <button
              onClick={handleNext}
              disabled={page === lastPage}
              className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}