"use client";
import { useState, useEffect } from "react";
import { FaChair, FaTimes } from "react-icons/fa";

interface Agency {
  id: number;
  name: string;
}

interface SeatLayout {
  row: number;
  seats_per_row: number;
}

interface BusFormData {
  name: string;
  number_of_seat: number;
  agency_id: number | string;
  status: string;
  seat_layout: SeatLayout;
}

export default function BusForm() {
  const [formData, setFormData] = useState<BusFormData>({
    name: "",
    number_of_seat: 0,
    agency_id: "",
    status: "",
    seat_layout: { row: 0, seats_per_row: 0 },
  });

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [excludedSeats, setExcludedSeats] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies/names`);
        const data = await res.json();
        setAgencies(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch agencies", error);
        setAgencies([]);
      }
    };

    fetchAgencies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("seat_layout")) {
      const key = name.split(".")[1] as keyof SeatLayout;
      setFormData((prev) => ({
        ...prev,
        seat_layout: {
          ...prev.seat_layout,
          [key]: Number(value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name as keyof BusFormData]: name === "number_of_seat" ? Number(value) : value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      number_of_seat: 0,
      agency_id: "",
      status: "",
      seat_layout: { row: 0, seats_per_row: 0 },
    });
    setExcludedSeats(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("number_of_seat", formData.number_of_seat.toString());
    payload.append("agency_id", formData.agency_id.toString());
    payload.append("status", formData.status);
    payload.append("seat_layout", JSON.stringify(formData.seat_layout));
    payload.append("exclude", JSON.stringify(Array.from(excludedSeats)));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seat-types`, {
        method: "POST",
        body: payload,
      });

      if (response.ok) {
        alert("Bus successfully added!");
        resetForm();
      } else {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        alert("Failed to add bus.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatExclusion = (seatId: number) => {
    setExcludedSeats((prev) => {
      const newExcludedSeats = new Set(prev);
      if (newExcludedSeats.has(seatId)) {
        newExcludedSeats.delete(seatId);
      } else {
        newExcludedSeats.add(seatId);
      }
      return newExcludedSeats;
    });
  };

  const renderSeatLayout = () => {
    const { row, seats_per_row } = formData.seat_layout;
    let seats = [];
    let seatId = 1;

    for (let i = 0; i < row; i++) {
      const rowSeats = [];
      for (let j = 0; j < seats_per_row; j++) {
        const currentSeatId = seatId;
        const isExcluded = excludedSeats.has(currentSeatId);
        rowSeats.push(
          <div
            key={currentSeatId}
            className={`w-8 h-8 border border-gray-300 rounded text-center flex items-center justify-center cursor-pointer ${
              isExcluded ? "bg-red-200" : "bg-green-200"
            }`}
            onClick={() => toggleSeatExclusion(currentSeatId)}
          >
            {isExcluded ? (
              <FaTimes className="text-red-500" />
            ) : (
              <FaChair className="text-green-500" />
            )}
          </div>
        );
        seatId++;
      }
      seats.push(
        <div key={i} className="flex gap-2 items-center">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Bus Layout</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bus Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bus Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter bus name"
            required
          />
        </div>

        {/* Agency */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Agency</label>
          <select
            name="agency_id"
            value={formData.agency_id}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          >
            <option value="">Select Agency</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="e.g. active/inactive"
            required
          />
        </div>

        {/* Number of Seats */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Seats</label>
          <input
            type="number"
            name="number_of_seat"
            value={formData.number_of_seat}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Seat Layout: Rows */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Rows</label>
          <input
            type="number"
            name="seat_layout.row"
            value={formData.seat_layout.row}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Seat Layout: Seats per Row */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Seats per Row</label>
          <input
            type="number"
            name="seat_layout.seats_per_row"
            value={formData.seat_layout.seats_per_row}
            onChange={handleChange}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          />
        </div>
      </div>

      {/* Seat Layout Preview */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Seat Layout Preview</h3>
        <div className="mt-2 space-y-2">{renderSeatLayout()}</div>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
