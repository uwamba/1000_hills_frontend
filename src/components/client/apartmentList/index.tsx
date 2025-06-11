'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';

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
  price?: number;
  currency?: string;
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
  });

  const [step, setStep] = useState<'form' | 'payment' | 'otp' | 'success'>('form');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  const fetchApartments = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/apartments?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch apartments');
      const json: ApartmentResponse = await res.json();
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

  const openDetailModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setSelectedPhotoIndex(0);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedApartment(null);
    setIsDetailModalOpen(false);
  };

  const openBookingModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
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

  const goToPaymentStep = () => {
    setStep('payment');
  };

  const sendOtp = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
    }, 1000);
  };

  const verifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
    }, 1000);
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
                    onClick={() => openDetailModal(apartment)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    See More Details
                  </button>

                  <button
                    onClick={() => openBookingModal(apartment)}
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
                      className={`w-24 h-24 object-cover rounded cursor-pointer ${
                        selectedPhotoIndex === index ? 'border-2 border-indigo-500' : ''
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

                <button
                  onClick={() => {
                    closeDetailModal();
                    openBookingModal(selectedApartment);
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
      <Dialog open={isBookingModalOpen} onClose={closeModal} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white max-w-md w-full rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
            >
              &times;
            </button>

            {step === 'form' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black">Book Apartment</h2>
                {/* Booking form fields */}
                <label className="block">
                  <span className="text-black">Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <label className="block">
                  <span className="text-black">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <label className="block">
                  <span className="text-black">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <label className="block">
                  <span className="text-black">Country</span>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <label className="block">
                  <span className="text-black">From</span>
                  <input
                    type="date"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <label className="block">
                  <span className="text-black">To</span>
                  <input
                    type="date"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  />
                </label>
                <div className="flex justify-between">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goToPaymentStep}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black">Choose Payment Method</h2>
                <label className="block">
                  <span className="text-black">Payment Method</span>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="">Select a payment method</option>
                    <option value="momo">Mobile Money</option>
                    <option value="card">Credit Card</option>
                  </select>
                </label>

                {formData.payment_method === 'momo' && (
                  <label className="block">
                    <span className="text-black">Mobile Money Number</span>
                    <input
                      type="text"
                      name="momo_number"
                      value={formData.momo_number}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-black"
                    />
                  </label>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('form')}
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                  >
                    Back
                  </button>
                  <button
                    onClick={sendOtp}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {isSending ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black">Enter OTP</h2>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="Enter OTP"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('payment')}
                    className="px-4 py-2 bg-gray-300 text-black rounded"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyOtp}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center text-green-600 font-semibold">
                Booking successful! 🎉
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
