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
  capacity: number;
  description: string;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
}

interface RoomResponse {
  current_page: number;
  last_page: number;
  data: Room[];
}

export default function RoomListClientPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRooms = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const json: RoomResponse = await res.json();

      setRooms(json.data);
      setFilteredRooms(json.data); // Initially unfiltered
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(page);
  }, [page]);

  useEffect(() => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (capacityFilter) {
      filtered = filtered.filter(room => room.capacity === parseInt(capacityFilter));
    }

    if (statusFilter) {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    setFilteredRooms(filtered);
  }, [searchTerm, capacityFilter, statusFilter, rooms]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < lastPage) setPage(page + 1);
  };

  const imageBaseUrl = 'http://127.0.0.1:8000/storage';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Room List</h1>

      {/* Filters Container */}
      <div className="bg-blue-600 p-6 mb-6 rounded-lg shadow-lg">
        <h2 className="text-white text-2xl font-bold mb-4">Filter Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by name */}
          <div>
            <label htmlFor="search" className="block text-white mb-2">Search by Name</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          {/* Filter by capacity */}
          <div>
            <label htmlFor="capacity" className="block text-white mb-2">Filter by Capacity</label>
            <input
              id="capacity"
              type="number"
              placeholder="Capacity"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          {/* Filter by status */}
          <div>
            <label htmlFor="status" className="block text-white mb-2">Filter by Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
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
      href={`/roomList/${room.id}`}
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
      <p className="text-gray-600 mt-1">Capacity: {room.capacity} people</p>

      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className={room.status === 'available' ? 'text-green-600' : 'text-red-600'}>
            {room.status || 'N/A'}
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