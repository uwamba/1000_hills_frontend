"use client";
import { useEffect, useState } from 'react';
import { FaChair, FaTimes } from 'react-icons/fa';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Booking {
  id: number;
  seat: string;
  client: Client;
}

interface SeatType {
  name: string;
  row: number;
  column: number;
  exclude: number[];
}

interface Bus {
  id: number;
  number_plate: string;
  seatType: SeatType;
  agency: string;
}

interface Journey {
  id: number;
  from: string;
  to: string;
  departure: string;
  bus: Bus;
  bookings: Booking[];
}

export default function JourneyListPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys-with-seats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const json = await res.json();
        console.log("Fetched journeys:", json.data);
        setJourneys(json.data || []);
      } catch (err) {
        console.error("Error fetching journeys:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, []);

  const renderSeatLayout = (
    row: number,
    column: number,
    exclude: number[] = [],
    bookings: Booking[] = []
  ) => {
    const layout = [];
    let seatNumber = 1;

    for (let i = 0; i < row; i++) {
      const rowSeats = [];

      for (let j = 0; j < column; j++) {
        const isExcluded = exclude.includes(seatNumber);
        const booking = bookings.find((b) => b.seat === String(seatNumber));
        const isBooked = !!booking;

        rowSeats.push(
          <div
            key={seatNumber}
            className={`w-8 h-8 border rounded flex items-center justify-center text-xs cursor-pointer ${isExcluded
                ? 'bg-gray-500 text-white'
                : isBooked
                  ? 'bg-red-500 text-white'
                  : 'bg-green-300 text-black'
              }`}
            title={`Seat ${seatNumber}`}
            onClick={() => {
              if (booking?.client) {
                setSelectedClient(booking.client);
                setShowClientModal(true);
              }
            }}
          >
            {isExcluded ? <FaTimes /> : <FaChair />}
          </div>
        );
        seatNumber++;
      }

      layout.push(
        <div key={i} className="flex gap-2 justify-center">
          {rowSeats}
        </div>
      );
    }

    return <div className="space-y-2 mt-2">{layout}</div>;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Journey List with Bus Layout</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading journeys...</div>
      ) : journeys.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No journeys found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeys.map((journey) => (
            <div
              key={journey.id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-300"
            >
              <h2 className="text-xl font-semibold text-indigo-600 mb-1">
                {journey.from} → {journey.to}
              </h2>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Departure:</span>{' '}
                {new Date(journey.departure).toLocaleString()}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Agency:</span> {journey.bus.agency}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Bus:</span> {journey.bus.number_plate}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Seat Type:</span> {journey.bus.seatType?.name}
              </p>

              <div className="mt-4">
                <h3 className="font-semibold mb-1">Seat Layout</h3>
                {journey.bus.seatType ? (
                  renderSeatLayout(
                    journey.bus.seatType.row,
                    journey.bus.seatType.column,
                    journey.bus.seatType.exclude,
                    journey.bookings
                  )
                ) : (
                  <p>No layout data.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full relative text-gray-800">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => setShowClientModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Client Information</h2>
            <p><span className="font-semibold text-gray-700">Name:</span> {selectedClient.name}</p>
            {selectedClient.email && (
              <p><span className="font-semibold text-gray-700">Email:</span> {selectedClient.email}</p>
            )}
            {selectedClient.phone && (
              <p><span className="font-semibold text-gray-700">Phone:</span> {selectedClient.phone}</p>
            )}
          </div>
        </div>

      )}
    </div>
  );
}
