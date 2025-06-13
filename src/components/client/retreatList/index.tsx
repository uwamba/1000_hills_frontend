'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import BookingRetreat from '../bookingRetreat';

interface Photo {
  id: number;
  path: string;
}

export interface Retreat {
  id: number;
  title: string;
  price_per_person: number;
  package_price: number;
  capacity: number;
  pricing_type: string;
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [filters, setFilters] = useState({
  min_price_per_person: '',
  max_price_per_person: '',
  min_package_price: '',
  max_package_price: '',
  min_capacity: '',
  max_capacity: '',
  pricing_type: '',
  from_date: '',
  to_date: '',
});

  const fetchRetreats = async (page: number, filtersOverride = filters) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        ...Object.fromEntries(
          Object.entries(filtersOverride).filter(([, value]) => value !== '')
        ),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/retreats?${params}`
      );
      if (!res.ok) throw new Error('Failed to fetch retreats');

      const json: RetreatResponse = await res.json();

      setRetreats((prev) => (page === 1 ? json.data : [...prev, ...json.data]));
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching retreats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetreats(1); // On mount
  }, []);

  const handleSearch = () => {
    fetchRetreats(1);
  };

  const handleClear = () => {
    const cleared = {
      price_per_person: '',
      package_price: '',
      capacity: '',
      pricing_type: '',
      from_date: '',
      to_date: '',
      min_price_per_person: '',
      max_price_per_person: '',
      min_package_price: '',
      max_package_price: '',
      min_capacity: '',
      max_capacity: '',
    };
    setFilters(cleared);
    fetchRetreats(1, cleared);
  };

  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  const openDetailModal = (retreat: Retreat) => {
    setSelectedRetreat(retreat);
    setSelectedPhotoIndex(0);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRetreat(null);
  };

  const handleBookNow = (retreat: Retreat) => {
    setSelectedRetreat(retreat);
    setIsDetailModalOpen(false);
    setIsBookingOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
    setSelectedRetreat(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Retreat List</h1>

      {/* Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md grid md:grid-cols-3 gap-4 border border-gray-200">
  {/* Price per Person Range */}
  <div className="flex gap-2">
    <input
      type="number"
      placeholder="Min Price/Person"
      value={filters.min_price_per_person}
      onChange={(e) => setFilters({ ...filters, min_price_per_person: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="number"
      placeholder="Max Price/Person"
      value={filters.max_price_per_person}
      onChange={(e) => setFilters({ ...filters, max_price_per_person: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* Package Price Range */}
  <div className="flex gap-2">
    <input
      type="number"
      placeholder="Min Package Price"
      value={filters.min_package_price}
      onChange={(e) => setFilters({ ...filters, min_package_price: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="number"
      placeholder="Max Package Price"
      value={filters.max_package_price}
      onChange={(e) => setFilters({ ...filters, max_package_price: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* Capacity Range */}
  <div className="flex gap-2">
    <input
      type="number"
      placeholder="Min Capacity"
      value={filters.min_capacity}
      onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="number"
      placeholder="Max Capacity"
      value={filters.max_capacity}
      onChange={(e) => setFilters({ ...filters, max_capacity: e.target.value })}
      className="w-1/2 border border-gray-300 p-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* Pricing Type */}
  <select
    value={filters.pricing_type}
    onChange={(e) => setFilters({ ...filters, pricing_type: e.target.value })}
    className="border border-gray-300 p-3 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Pricing Type</option>
    <option value="package">Package</option>
    <option value="per_person">Per Person</option>
  </select>

  {/* Date Filters */}
  <input
    type="date"
    value={filters.from_date}
    onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
    className="border border-gray-300 p-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
  <input
    type="date"
    value={filters.to_date}
    onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
    className="border border-gray-300 p-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {/* Buttons */}
  <div className="col-span-3 flex justify-end gap-3 mt-2">
    <button
      onClick={handleSearch}
      className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      Search
    </button>
    <button
      onClick={handleClear}
      className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      Clear
    </button>
  </div>
</div>


      {/* Retreat Cards */}
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
                <p className="text-gray-600 mt-1">Price: ${retreat.capacity}</p>
                <p className="text-gray-600 mt-1">Price/Person: {retreat.price_per_person} people</p>
                 <p className="text-gray-600 mt-1">Package Price: {retreat.package_price} people</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => openDetailModal(retreat)}
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

          {page < lastPage && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchRetreats(page + 1)}
                className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Show More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail & Booking modals */}
      <Dialog open={isDetailModalOpen} onClose={closeDetailModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
          <Dialog.Panel className="bg-white max-w-5xl w-full rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <Dialog.Title className="text-3xl font-bold text-indigo-700">
                {selectedRetreat?.title}
              </Dialog.Title>
              <button
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-4">{selectedRetreat?.address}</p>

            {selectedRetreat?.photos?.length ? (
              <div className="mb-6">
                <div className="w-full h-96 mb-4 rounded overflow-hidden border">
                  <img
                    src={
                      selectedRetreat.photos?.[selectedPhotoIndex]
                        ? `${imageBaseUrl}/${selectedRetreat.photos[selectedPhotoIndex].path}`
                        : '/placeholder.jpg'
                    }
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
                      className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${index === selectedPhotoIndex
                          ? 'border-indigo-500'
                          : 'border-gray-200 hover:border-gray-400'
                        }`}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}


            {selectedRetreat && (
              <div className="mt-6">
                <button
                  onClick={() => handleBookNow(selectedRetreat)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book Now
                </button>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {selectedRetreat && (
        <BookingRetreat
          isOpen={isBookingOpen}
          onClose={closeBookingModal}
          retreatId={selectedRetreat.id}
          retreatTitle={selectedRetreat.title}
        />
      )}
    </div>
  );
}
