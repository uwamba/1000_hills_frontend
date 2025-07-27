'use client';

import React, { useEffect, useState } from 'react';

interface Client {
  id: number;
  names: string;
}

interface Apartment {
  id: number;
  name: string;
  location: string;
}

interface Booking {
  id: number;
  from_date_time: string;
  to_date_time: string;
  seat: number;
  amount_to_pay: number;
  status: string;
  client: Client;
  apartment: Apartment;
}

const ApartmentBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchApartmentBookings = async () => {
    try {
      const authToken = localStorage.getItem('authToken');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/apartment-bookings`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching apartment bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartmentBookings();
  }, []);

  const handleCheckPayment = (id: number) => {
    console.log("Check payment for booking", id);
  };

  const handleApproveBooking = async (id: number) => {
    console.log("Approving booking", id);
  };

  const handleCancelBooking = async (id: number) => {
    console.log("Canceling booking", id);
  };

  // Filter by apartment name
  const filteredBookings = bookings.filter((booking) =>
    booking.apartment?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered bookings by from_date_time according to sortOrder
  const sortedBookings = filteredBookings.sort((a, b) => {
    const dateA = new Date(a.from_date_time).getTime();
    const dateB = new Date(b.from_date_time).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort order between asc and desc
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading) return <div className="p-4 text-black">Loading...</div>;

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-semibold mb-6">Apartment Bookings</h1>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by apartment name..."
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          onClick={toggleSortOrder}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          title="Toggle Sort by From Date"
        >
          Sort by From Date: {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
        </button>
      </div>

      {sortedBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border border-gray-300 divide-y divide-gray-200 text-sm text-black">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th
                  className="border px-4 py-2 text-left cursor-pointer"
                  onClick={toggleSortOrder}
                  title="Click to toggle sort order"
                >
                  From {sortOrder === 'asc' ? '↑' : '↓'}
                </th>
                <th className="border px-4 py-2 text-left">To</th>
                <th className="border px-4 py-2 text-left">Amount</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Apartment</th>
                <th className="border px-4 py-2 text-left">Location</th>
                <th className="border px-4 py-2 text-left">Client</th>
                <th className="border px-4 py-2 text-left min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 text-black">
                  <td className="border px-4 py-2">{booking.from_date_time}</td>
                  <td className="border px-4 py-2">{booking.to_date_time}</td>
                  <td className="border px-4 py-2">${booking.amount_to_pay}</td>
                  <td className="border px-4 py-2">{booking.status}</td>
                  <td className="border px-4 py-2">{booking.apartment?.name}</td>
                  <td className="border px-4 py-2">{booking.apartment?.location}</td>
                  <td className="border px-4 py-2">{booking.client?.names}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-nowrap gap-1">
                      <button
                        onClick={() => handleCheckPayment(booking.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                      >
                        Check
                      </button>
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApartmentBookingsPage;
