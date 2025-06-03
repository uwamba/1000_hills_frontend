'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';

interface Photo {
    id: number;
    url: string;
}

interface Apartment {
    id: number;
    name: string;
    address: string;
    number_of_bedroom: number;
    kitchen_inside: boolean;
    kitchen_outside: boolean;
    number_of_floor: number;
    status: string | null;
    deleted_on: string | null;
    photos: Photo[];
}


interface ApartmentResponse {
    current_page: number;
    last_page: number;
    data: Apartment[];
}

export default function ApartmentList() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);


    const fetchApartments = async (page: number) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments?page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch apartments');
            const json: ApartmentResponse = await res.json();

            console.log('Fetched apartments:', json.data);

            setApartments(json.data);
            setPage(json.current_page);
            setLastPage(json.last_page);
        } catch (error) {
            console.error('Error fetching apartments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApartments(page);
    }, [page]);

    const handlePrev = () => page > 1 && setPage(page - 1);
    const handleNext = () => page < lastPage && setPage(page + 1);

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

    const openModal = (apartment: Apartment) => {
        setSelectedApartment(apartment);
        setSelectedPhotoIndex(0);
        setIsModalOpen(true);
    };

    const handleBookNow = (apartment: Apartment) => {
        // Redirect to booking page or open booking modal
        console.log('Booking:', apartment);
        // Example: navigate(`/booking/${apartment.id}`);
    };

    const closeModal = () => {
        setSelectedApartment(null);
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Apartment List</h1>

            {loading ? (
                <div className="text-center text-lg text-gray-600">Loading apartments...</div>
            ) : apartments.length === 0 ? (
                <div className="text-center text-lg text-gray-500">No apartments found.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apartments.map((apartment) => (
                            <div
                                key={apartment.id}
                                className="bg-white rounded-lg shadow-lg p-4 border hover:shadow-2xl transform transition-transform hover:scale-105"
                            >
                                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={
                                            apartment.photos?.length > 0
                                                ? `${imageBaseUrl}/${apartment.photos[0].url}`
                                                : '/placeholder.jpg'
                                        }
                                        alt={apartment.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold text-indigo-600">{apartment.name}</h2>
                                <p className="text-md text-gray-500">{apartment.address}</p>
                                <p className="text-gray-700 mt-2">Bedrooms: {apartment.number_of_bedroom}</p>
                                <p className="text-gray-700">Floors: {apartment.number_of_floor}</p>

                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => openModal(apartment)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        See More Details
                                    </button>

                                    <button
                                        onClick={() => handleBookNow(apartment)} // Add your handler here
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Pagination */}
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

                    {/* Modal */}
                    {/* Modal */}
                    <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
                        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

                        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
                            <Dialog.Panel className="bg-white max-w-5xl w-full rounded-xl p-6 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <Dialog.Title className="text-3xl font-bold text-indigo-700">
                                        {selectedApartment?.name}
                                    </Dialog.Title>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-800 text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-4">{selectedApartment?.address}</p>

                                {/* Gallery */}
                                {Array.isArray(selectedApartment?.photos) && selectedApartment.photos.length > 0 && (

                                    <div className="mb-6">
                                        {/* Main Photo */}
                                        <div className="w-full h-96 mb-4 rounded overflow-hidden border">
                                            <img
                                                src={`${imageBaseUrl}/${selectedApartment.photos[selectedPhotoIndex].url}`}
                                                alt="Main"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Thumbnails */}
                                        <div className="flex flex-wrap gap-3">
                                            {selectedApartment.photos.map((photo, index) => (
                                                <img
                                                    key={photo.id}
                                                    src={`${imageBaseUrl}/${photo.url}`}
                                                    onClick={() => setSelectedPhotoIndex(index)}
                                                    className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${index === selectedPhotoIndex
                                                        ? 'border-indigo-500'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                    alt={`Thumbnail ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Apartment Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
                                    <p><strong>Bedrooms:</strong> {selectedApartment?.number_of_bedroom}</p>
                                    <p><strong>Floors:</strong> {selectedApartment?.number_of_floor}</p>
                                    <p><strong>Kitchen Inside:</strong> {selectedApartment?.kitchen_inside ? 'Yes' : 'No'}</p>
                                    <p><strong>Kitchen Outside:</strong> {selectedApartment?.kitchen_outside ? 'Yes' : 'No'}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span
                                            className={
                                                selectedApartment?.status === 'active' ? 'text-green-600' : 'text-red-600'
                                            }
                                        >
                                            {selectedApartment?.status || 'N/A'}
                                        </span>
                                    </p>
                                    {selectedApartment && (
                                        <div className="mt-6">
                                            <button
                                                onClick={() => handleBookNow(selectedApartment)}
                                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    )}

                                </div>

                                {/* Book Now Button */}


                            </Dialog.Panel>
                        </div>
                    </Dialog>

                </>
            )}
        </div>
    );
}
