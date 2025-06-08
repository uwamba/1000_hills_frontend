'use client';

import React, { useEffect, useState } from 'react';

interface Client {
  id: number;
  names: string;
}

interface Room {
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
  room: Room;
}

const RoomBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomBookings = async () => {
    try {
      const authToken = localStorage.getItem('authToken');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/room-bookings`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.error('Failed to fetch room bookings');
        setBookings([]);
        return;
      }

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
      console.error('Error fetching room bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomBookings();
  }, []);

  const handleCheckPayment = (id: number) => {
  console.log("Check payment for booking", id);
  // Optional: open modal, fetch payment info, etc.
};

const handleApproveBooking = async (id: number) => {
  console.log("Approving booking", id);
  // TODO: Send API request to update status to "approved"
};

const handleCancelBooking = async (id: number) => {
  console.log("Canceling booking", id);
  // TODO: Send API request to update status to "cancelled"
};


  if (loading) return <div className="p-4">Loading...</div>;

  return (
  <div className="p-6 bg-white min-h-screen">
  <h1 className="text-3xl font-semibold text-gray-800 mb-6">Room Bookings</h1>

  {bookings.length === 0 ? (
    <p className="text-gray-500">No bookings found.</p>
  ) : (
    <div className="grid gap-6 md:grid-cols-2">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200"
        >
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">From:</span> {booking.from_date_time}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">To:</span> {booking.to_date_time}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">Seat:</span> {booking.seat}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">Amount:</span> ${booking.amount_to_pay}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">Status:</span> {booking.status}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">Room:</span> {booking.room?.name} - {booking.room?.location}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            <span className="font-semibold text-gray-700">Client:</span> {booking.client?.names}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCheckPayment(booking.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
            >
              Check Payment
            </button>
            <button
              onClick={() => handleApproveBooking(booking.id)}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleCancelBooking(booking.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


  );
};

export default RoomBookingsPage;
