"use client";

import { useEffect, useState } from 'react';

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
}

interface ApartmentResponse {
  current_page: number;
  last_page: number;
  data: Apartment[];
}

export default function ApartmentListPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchApartments = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments?page=${page}`);
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

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < lastPage) setPage(page + 1);
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
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-indigo-600">{apartment.name}</h2>
                <p className="text-md text-gray-500">{apartment.address}</p>
                <p className="text-gray-700 mt-2">{`Bedrooms: ${apartment.number_of_bedroom}`}</p>
                <p className="text-gray-700">{`Kitchen Inside: ${apartment.kitchen_inside ? 'Yes' : 'No'}`}</p>
                <p className="text-gray-700">{`Kitchen Outside: ${apartment.kitchen_outside ? 'Yes' : 'No'}`}</p>
                <p className="text-gray-700">{`Floors: ${apartment.number_of_floor}`}</p>

                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={apartment.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                      {apartment.status || 'N/A'}
                    </span>
                  </div>
                  {apartment.deleted_on && (
                    <div className="text-red-500">
                      <span className="font-medium">Deleted On:</span>{' '}
                      {new Date(apartment.deleted_on).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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
    </div>
  );
}
