'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/apartments/${params.id}`
        );
        if (!res.ok) throw new Error('Failed to fetch apartment');
        const data: Apartment = await res.json();
        setApartment(data);
      } catch (error) {
        console.error('Error fetching apartment:', error);
      }
    };

    fetchApartment();
  }, [params.id]);

  if (!apartment) {
    return <div className="p-6 text-gray-600">Loading booking form...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Book {apartment.name}</h1>

      <div className="mb-4">
        <img
          src={
            apartment.photos?.length > 0
              ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE}/${apartment.photos[0].url}`
              : '/placeholder.jpg'
          }
          alt={apartment.name}
          className="w-full h-64 object-cover rounded"
        />
      </div>

      <div className="text-gray-700 mb-4">
        <p><strong>Address:</strong> {apartment.address}</p>
        <p><strong>Bedrooms:</strong> {apartment.number_of_bedroom}</p>
        <p><strong>Floors:</strong> {apartment.number_of_floor}</p>
        <p><strong>Status:</strong> {apartment.status || 'N/A'}</p>
      </div>

      {/* Replace with your actual booking form fields */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            placeholder="Enter your phone"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Confirm Booking
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Cancel
      </button>
    </div>
  );
}
