"use client";
import { useEffect, useState } from "react";
import { FaChair, FaTimes } from "react-icons/fa";

interface BusLayout {
  id: number;
  name: string;
  seat_layout: {
    row: number;
    seats_per_row: number;
  };
  exclude: number[] | null;
}

export default function BusLayoutsPage() {
  const [buses, setBuses] = useState<BusLayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seat-types`);
        const data = await res.json();
        console.log("Bus layout response:", data);
        setBuses(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch bus layouts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayouts();
  }, []);

  // Function to render seats based on the row and seat configuration
  const renderSeatLayout = (rows: number, seatsPerRow: number, exclude: number[] | null) => {
    const seats = [];
    let seatId = 1;

    // Loop through rows and columns to create the seat layout
    for (let i = 0; i < rows; i++) {
      const rowSeats = [];
      for (let j = 0; j < seatsPerRow; j++) {
        const isExcluded = exclude && exclude.includes(seatId);
        rowSeats.push(
          <div
            key={seatId}
            className={`w-8 h-8 border rounded flex items-center justify-center text-xs ${
              isExcluded ? "bg-gray-500 text-white" : "bg-green-300 text-black"
            }`}
          >
            {isExcluded ? (
              <FaTimes className="text-white" />
            ) : (
              <FaChair className="text-black" />
            )}
          </div>
        );
        seatId++;
      }
      seats.push(
        <div key={i} className="flex gap-2 justify-center">
          {rowSeats}
        </div>
      );
    }
    return <div className="space-y-2 mt-2">{seats}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bus Seat Layouts</h1>
      {loading ? (
        <p>Loading layouts...</p>
      ) : buses.length === 0 ? (
        <p>No bus layouts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buses.map((bus) => (
            <div key={bus.id} className="p-4 border rounded shadow bg-white">
              <h2 className="font-semibold text-lg">{bus.name}</h2>
              <p className="text-sm text-gray-500">Layout Preview:</p>
              {/* Access the seat_layout and render it properly */}
              {renderSeatLayout(
                bus.seat_layout.row,
                bus.seat_layout.seats_per_row,
                bus.exclude || []  // Ensure exclude is an array
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
