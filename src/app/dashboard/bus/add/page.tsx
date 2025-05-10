"use client";
import { useState, useEffect } from "react";

interface Agency {
    id: number;
    name: string;
}

interface SeatType {
    id: number;
    name: string;
}

interface BusFormData {
    name: string;
    seat_type: number | string;
    number_of_seat: number;
    agency_id: number | string;
    status: string;
}

export default function BusForm() {
    const [formData, setFormData] = useState<BusFormData>({
        name: "",
        seat_type: "",
        number_of_seat: 0,
        agency_id: "",
        status: "",
    });

    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);

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

        const fetchSeatTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seat-types`);
                const data = await res.json();
                console.log("Seat type response:", data);
                setSeatTypes(Array.isArray(data) ? data : data.data || []);
            } catch (error) {
                console.error("Failed to fetch seat types", error);
                setSeatTypes([]);
            }
        };

        fetchAgencies();
        fetchSeatTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("seat_type", formData.seat_type.toString());
        payload.append("number_of_seat", formData.number_of_seat.toString());
        payload.append("agency_id", formData.agency_id.toString());
        payload.append("status", formData.status);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/buses`, {
                method: "POST",
                body: payload,
            });

            if (response.ok) {
                alert("Bus successfully added!");
                setFormData({
                    name: "",
                    seat_type: "",
                    number_of_seat: 0,
                    agency_id: "",
                    status: "",
                });
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                alert("Failed to add bus.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("There was an error submitting the form.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Bus</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bus Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

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

                <div>
                    <label className="block text-sm font-medium text-gray-700">Seat Type</label>
                    <select
                        name="seat_type"
                        value={formData.seat_type}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select Seat Type</option>
                        {seatTypes.map((seat) => (
                            <option key={seat.id} value={seat.id}>
                                {seat.name}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Submit
                </button>
            </div>
        </form>
    );
}
