'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import BookingRetreat from '../bookingRetreat';




interface Photo {
    id: number;
    path: string;
}

interface Retreat {
    id: number;
    title: string;
    description: string;
    address: string;
    status: string | null;
    deleted_on: string | null;
    photos: Photo[];
}

interface RetreatResponse {
    current_page: number;
    last_page: number;
    data: Retreat[];
}

export default function RetreatList() {
    const [retreats, setRetreats] = useState<Retreat[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    const fetchRetreats = async (page: number) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/retreats?page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch retreats');
            const json: RetreatResponse = await res.json();

            setRetreats(prev => page === 1 ? json.data : [...prev, ...json.data]);
            setPage(json.current_page);
            setLastPage(json.last_page);
        } catch (error) {
            console.error('Error fetching retreats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRetreats(page);
    }, [page]);

     const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

    const openModal = (retreat: Retreat) => {
        setSelectedRetreat(retreat);
        setSelectedPhotoIndex(0);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRetreat(null);
        setIsModalOpen(false);
    };

    const handleBookNow = (retreat: Retreat) => {
        console.log('Booking:', retreat);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Retreat List</h1>

            {loading && page === 1 ? (
                <div className="text-center text-lg text-gray-600">Loading retreats...</div>
            ) : retreats.length === 0 ? (
                <div className="text-center text-lg text-gray-500">No retreats found.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {retreats.map((retreat) => (
                            <div
                                key={retreat.id}
                                className="bg-white rounded-lg shadow-lg p-4 border hover:shadow-2xl transform transition-transform hover:scale-105"
                            >
                                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={
                                            retreat.photos?.length > 0
                                                ? `${imageBaseUrl}/${retreat.photos[0].path}`
                                                : '/placeholder.jpg'
                                        }
                                        alt={retreat.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold text-indigo-600">{retreat.title}</h2>
                                <p className="text-md text-gray-500">{retreat.address}</p>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => openModal(retreat)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        See More Details
                                    </button>
                                    <button
                                        onClick={() => handleBookNow(retreat)}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {page < lastPage && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setPage(page + 1)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Show More'}
                            </button>
                        </div>
                    )}

                    {/* Retreat Detail Modal */}
                    <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
                        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

                        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
                            <Dialog.Panel className="bg-white max-w-5xl w-full rounded-xl p-6 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <Dialog.Title className="text-3xl font-bold text-indigo-700">
                                        {selectedRetreat?.title}
                                    </Dialog.Title>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-800 text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-4">{selectedRetreat?.address}</p>

                                {/* Gallery */}
                                {Array.isArray(selectedRetreat?.photos) && selectedRetreat.photos.length > 0 && (
                                    <div className="mb-6">
                                        <div className="w-full h-96 mb-4 rounded overflow-hidden border">
                                            <img
                                                src={`${imageBaseUrl}/${selectedRetreat.photos[selectedPhotoIndex].path}`}
                                                alt="Main"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedRetreat.photos.map((photo, index) => (
                                                <img
                                                    key={photo.id}
                                                    src={`${imageBaseUrl}/${photo.path}`}
                                                    onClick={() => setSelectedPhotoIndex(index)}
                                                    className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${index === selectedPhotoIndex ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-400'}`}
                                                    alt={`Thumbnail ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Retreat Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
                                    <p><strong>Title:</strong> {selectedRetreat?.title}</p>
                                    <p><strong>Address:</strong> {selectedRetreat?.address}</p>
                                    <p><strong>Description:</strong> {selectedRetreat?.description}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span
                                            className={
                                                selectedRetreat?.status === 'active'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {selectedRetreat?.status || 'N/A'}
                                        </span>
                                    </p>
                                    {selectedRetreat?.deleted_on && (
                                        <p><strong>Deleted On:</strong> {selectedRetreat.deleted_on}</p>
                                    )}
                                    {selectedRetreat && (
                                        <div className="mt-6 md:col-span-2">
                                            <button
                                                onClick={() => handleBookNow(selectedRetreat)}
                                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </div>
                    </Dialog>
                </>
            )}
        </div>
    );
}
