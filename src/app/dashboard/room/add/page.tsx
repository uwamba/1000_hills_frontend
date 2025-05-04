"use client";
import { useState, useEffect } from "react";

interface Hotel {
    id: number;
    name: string;
}

interface FormDataType {
    name: string;
    type: string;
    has_wireless: boolean;
    bed_size: string;
    has_bathroom: boolean;
    price: number;
    currency: string;
    number_of_people: number;
    has_ac: boolean;
    hotel_id: number | string;
    status: string;
}

export default function RoomForm() {
    const [formData, setFormData] = useState<FormDataType>({
        name: "",
        type: "",
        has_wireless: false,
        bed_size: "",
        has_bathroom: false,
        price: 0,
        currency: "",
        number_of_people: 0,
        has_ac: false,
        hotel_id: "",
        status: "",
    });

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);

    useEffect(() => {
        const fetchHotels = async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels/names`);
            const data = await response.json();
            setHotels(data); // where hotels is useState([])
          } catch (error) {
            console.error("Failed to fetch hotel names", error);
          }
        };
      
        fetchHotels();
      }, []);
      

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const { name, value } = target;

        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                [name]: target.checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newPhotos = [...photos];
            newPhotos[index] = e.target.files[0];
            setPhotos(newPhotos);
        }
    };

    const addPhotoField = () => {
        setPhotos([...photos, new File([], "")]); // Placeholder
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formPayload = new FormData();
        formPayload.append("name", formData.name);
        formPayload.append("type", formData.type);
        formPayload.append("has_wireless", formData.has_wireless ? "1" : "0");
        formPayload.append("bed_size", formData.bed_size);
        formPayload.append("has_bathroom", formData.has_bathroom ? "1" : "0");
        formPayload.append("price", formData.price.toString());
        formPayload.append("currency", formData.currency);
        formPayload.append("number_of_people", formData.number_of_people.toString());
        formPayload.append("has_ac", formData.has_ac ? "1" : "0");
        formPayload.append("hotel_id", formData.hotel_id.toString());
        formPayload.append("status", formData.status);

        photos.forEach((photo) => {
            if (photo instanceof File && photo.size > 0) {
                formPayload.append("photos[]", photo);
            }
        });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms/`, {
                method: "POST",
                body: formPayload,
            });

            if (response.ok) {
                alert("Room successfully added!");
                setFormData({
                    name: "",
                    type: "",
                    has_wireless: false,
                    bed_size: "",
                    has_bathroom: false,
                    price: 0,
                    currency: "",
                    number_of_people: 0,
                    has_ac: false,
                    hotel_id: "",
                    status: "",
                });
                setPhotos([]);
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error("Failed to add room");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("There was an error adding the room.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Room</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Room Name</label>
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
                    <label className="block text-sm font-medium text-gray-700">Room Type</label>
                    <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bed Size</label>
                    <input
                        type="text"
                        name="bed_size"
                        value={formData.bed_size}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of People</label>
                    <input
                        type="number"
                        name="number_of_people"
                        value={formData.number_of_people}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Has Wireless</label>
                    <input
                        type="checkbox"
                        name="has_wireless"
                        checked={formData.has_wireless}
                        onChange={handleChange}
                        className="ml-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Has Bathroom</label>
                    <input
                        type="checkbox"
                        name="has_bathroom"
                        checked={formData.has_bathroom}
                        onChange={handleChange}
                        className="ml-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Has AC</label>
                    <input
                        type="checkbox"
                        name="has_ac"
                        checked={formData.has_ac}
                        onChange={handleChange}
                        className="ml-2"
                    />
                </div>

                {/* Hotel selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel</label>
                    <select
                        name="hotel_id"
                        value={formData.hotel_id}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select a hotel</option>
                        {Array.isArray(hotels) &&
                            hotels.map((hotel) => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
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

            {/* Photo upload */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">Photos</label>
                <div className="space-y-2">
                    {photos.map((_, index) => (
                        <input
                            key={index}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoChange(index, e)}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:border-gray-300 file:bg-gray-50"
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addPhotoField}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                >
                    Add another photo
                </button>
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
