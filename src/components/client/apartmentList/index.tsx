'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import BookingModal from '../bookingFormApartment';

interface Photo {
  id: number;
  url: string;
}
interface Booking {
  from: string;
  to: string;
}


interface Apartment {
  id: number;
  name: string;
  address: string;
  description: string;
  number_of_bedroom: number;
  kitchen_inside: boolean;
  kitchen_outside: boolean;
  number_of_floor: number;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
  price_per_night: number;
  price_per_month: number;
  currency?: string;
  bookings: Booking[];
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [pricePerDay, setPricePerDay] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    from: '',
    to: '',
    payment_method: '',
    momo_number: '',
    extra_note: '',
    pricing_method: "daily", // new field
  });

  const [filters, setFilters] = useState({
    price_type: 'night',
    min_price: '',
    max_price: '',
    from_date: '',
    to_date: '',
  });






  const [step, setStep] = useState<'form' | 'payment' | 'otp' | 'success'>('form');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);


  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  const fetchApartments = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      params.append('page', String(page));

      // Append each filter only if it has a value
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          params.append(key, value);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/apartments?${params.toString()}`

      );

      if (!res.ok) throw new Error('Failed to fetch apartments');

      const json: ApartmentResponse = await res.json();
      console.log("log dada", json.data);
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
    fetchApartments(1); // Reset to page 1 on filter change
  }, [filters]);




  const handlePrev = () => page > 1 && fetchApartments(page - 1);
  const handleNext = () => page < lastPage && fetchApartments(page + 1);


  const openDetailModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setSelectedPhotoIndex(0);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedApartment(null);
    setIsDetailModalOpen(false);
  };

  const openBookingModal = ( apartment: Apartment,
  price_per_night: number,
  price_per_month: number) => {
    setSelectedApartment(apartment);

    setPricePerDay

    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      from: '',
      to: '',
      payment_method: '',
      momo_number: '',
      extra_note: '',
      pricing_method: "daily", // new field
    });
    setOtp('');
    setStep('form');
    setIsBookingModalOpen(true);
  };

  const closeModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };






  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={filters.price_type}
          onChange={(e) => setFilters({ ...filters, price_type: e.target.value })}
          className="p-2 border rounded text-black"
        >
          <option value="night">Price per Night</option>
          <option value="month">Price per Month</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.min_price}
          onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
          className="p-2 border rounded text-black"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.max_price}
          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          className="p-2 border rounded text-black"
        />

        <input
          type="date"
          value={filters.from_date}
          onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
          className="p-2 border rounded text-black"
        />

        <input
          type="date"
          value={filters.to_date}
          onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
          className="p-2 border rounded text-black"
        />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Apartment List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading apartments...</div>
      ) : apartments.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No apartments found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <div key={apartment.id} className="bg-white rounded-lg shadow-lg p-4 border hover:shadow-2xl transform transition-transform hover:scale-105">
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
                <p className="text-sm text-gray-600">
                  <strong>Price/night:</strong> {apartment.price_per_night ? `$${apartment.price_per_night}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Price/month:</strong> {apartment.price_per_month ? `$${apartment.price_per_month}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {apartment.description ? `$${apartment.description}` : 'N/A'}
                </p>
               
           
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => openDetailModal(apartment)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    See More Details
                  </button>

                  <button
                    onClick={() => openBookingModal(apartment,apartment.price_per_night,apartment.price_per_month)}
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
        </>
      )}

      {/* Apartment Details Modal */}
      <Dialog open={isDetailModalOpen} onClose={closeDetailModal} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white max-w-2xl w-full rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeDetailModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
            >
              &times;
            </button>
            {selectedApartment && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 mb-4">{selectedApartment.name}</h2>
                <div className="flex space-x-2 overflow-x-auto mb-4">
                  {selectedApartment.photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={`${imageBaseUrl}/${photo.url}`}
                      alt={`Apartment photo ${index + 1}`}
                      className={`w-24 h-24 object-cover rounded cursor-pointer ${selectedPhotoIndex === index ? 'border-2 border-indigo-500' : ''
                        }`}
                      onClick={() => setSelectedPhotoIndex(index)}
                    />
                  ))}
                </div>
                <div className="mb-4">
                  <img
                    src={`${imageBaseUrl}/${selectedApartment.photos[selectedPhotoIndex].url}`}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded"
                  />
                </div>
                <p className="text-gray-700 mb-2">{selectedApartment.address}</p>
                <p className="text-gray-700 mb-2">
                  Bedrooms: {selectedApartment.number_of_bedroom}
                </p>
                <p className="text-gray-700 mb-2">Floors: {selectedApartment.number_of_floor}</p>
                <p className="text-gray-700 mb-2">Price /Night: {selectedApartment.price_per_night}</p>

                <p className="text-gray-700 mb-2">Price /Month: {selectedApartment.price_per_month}</p>
                <p className="text-gray-700 mb-2">Kitchen Inside: {selectedApartment.kitchen_inside}</p>
                <p className="text-gray-700 mb-2">Kitchen Outside: {selectedApartment.kitchen_outside}</p>
                <p className="text-gray-700 mb-2">Description: {selectedApartment.description}</p>
                <h3 className="text-sm text-gray-600">Unavailable Dates:</h3>
                <ul className="text-red-600">
                  {Array.isArray(selectedApartment.bookings) && selectedApartment.bookings.length > 0 ? (
                    selectedApartment.bookings.map((booking, index) => (
                      <li key={index}>
                        From: {booking.from?.slice(0, 10)} - To: {booking.to?.slice(0, 10)}
                      </li>
                    ))
                  ) : (
                    <li>Currently available (no bookings)</li>
                  )}
                </ul>
                <button
                  onClick={() => {
                    closeDetailModal();
                    openBookingModal(selectedApartment,selectedApartment.price_per_night,selectedApartment.price_per_month);
                    // Pass the price per night and month to the booking modal);
                    selectedApartment.id
                  }}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book Now
                </button>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        closeModal={() => setIsBookingModalOpen(false)}
        apartment={selectedApartment}
      />


    </div>
  );
}
