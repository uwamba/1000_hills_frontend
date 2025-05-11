
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

interface Agency {
    id: number;
    name: string;
}

export default function CreateBusPage() {
    const [formData, setFormData] = useState({
        name: "",
        seat_type_id: "", // ensure it's a string
        number_of_seat: "",
        agency_id: "",
        status: "",
    });

    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [seatLayouts, setSeatLayouts] = useState<BusLayout[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBusLayout, setSelectedBusLayout] = useState<BusLayout | null>(null);
    const [loadingLayouts, setLoadingLayouts] = useState(false);

    useEffect(() => {
        // Fetch agencies
        const fetchAgencies = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies`);
            const data = await res.json();
            setAgencies(data?.data || []);
        };

        fetchAgencies();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("seat_type_id", formData.seat_type_id); // Send the correct seat_type_id
        payload.append("number_of_seat", formData.number_of_seat);
        payload.append("agency_id", formData.agency_id);
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
                    seat_type_id: "",
                    number_of_seat: "",
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

    const openSeatTypeModal = async () => {
        setLoadingLayouts(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/seat-types`);
            const data = await res.json();
            setSeatLayouts(data?.data || []);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error loading seat types", err);
        } finally {
            setLoadingLayouts(false);
        }
    };

    const handleSeatTypeSelect = (layout: BusLayout) => {
        setSelectedBusLayout(layout);
        setFormData({
            ...formData,
            seat_type_id: layout.id.toString(), // Set seat_type_id when layout is selected
        });
        setIsModalOpen(false);
    };

    const renderSeatLayout = (
        rows: number,
        seatsPerRow: number,
        exclude: number[] | null
    ) => {
        const seats = [];
        let seatId = 1;

        for (let i = 0; i < rows; i++) {
            const rowSeats = [];
            for (let j = 0; j < seatsPerRow; j++) {
                const isExcluded = exclude?.includes(seatId);
                rowSeats.push(
                    <div
                        key={seatId}
                        className={`w-8 h-8 border rounded flex items-center justify-center text-xs ${isExcluded ? "bg-gray-500 text-white" : "bg-green-300 text-black"
                            }`}
                    >
                        {isExcluded ? <FaTimes /> : <FaChair />}
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
        <div className="max-w-4xl mx-auto p-6">
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
                        <button
                            type="button"
                            onClick={openSeatTypeModal}
                            className="w-full mt-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {selectedBusLayout ? `Selected: ${selectedBusLayout.name}` : "Select Seat Type"}
                        </button>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 rounded relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                        >
                            <FaTimes />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Select Seat Layout</h3>

                        {loadingLayouts ? (
                            <p>Loading seat layouts...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {seatLayouts.map((layout) => (
                                    <div
                                        key={layout.id}
                                        onClick={() => handleSeatTypeSelect(layout)}
                                        className={`p-4 border rounded cursor-pointer shadow ${selectedBusLayout?.id === layout.id ? "ring-2 ring-blue-500" : ""
                                            }`}
                                    >
                                        <h4 className="font-medium">{layout.name}</h4>
                                        {renderSeatLayout(
                                            layout.seat_layout.row,
                                            layout.seat_layout.seats_per_row,
                                            layout.exclude
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedBusLayout && (
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="mt-4 py-2 px-6 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Confirm Selection
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
