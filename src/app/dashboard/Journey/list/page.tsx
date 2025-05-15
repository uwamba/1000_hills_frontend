'use client';

import { useEffect, useState } from 'react';

interface Journey {
  id: number;
  route_id: number;
  from: string;
  to: string;
  departure: string;
  return: string;
  status: string | null;
  deleted_on: string | null;
}

interface JourneyResponse {
  current_page: number;
  last_page: number;
  data: Journey[];
}

export default function JourneyListPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchJourneys = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch journeys');
      const json: JourneyResponse = await res.json();

      setJourneys(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < lastPage) setPage(page + 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Journey List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading journeys...</div>
      ) : journeys.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No journeys found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <div
                key={journey.id}
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-indigo-600">Journey #{journey.id}</h2>
                <p className="text-gray-700 mt-2">
                  <span className="font-medium">From:</span> {journey.from}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">To:</span> {journey.to}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Departure:</span>{' '}
                  {new Date(journey.departure).toLocaleString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Return:</span>{' '}
                  {new Date(journey.return).toLocaleString()}
                </p>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={journey.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                      {journey.status || 'N/A'}
                    </span>
                  </div>
                  {journey.deleted_on && (
                    <div className="text-red-500">
                      <span className="font-medium">Deleted On:</span>{' '}
                      {new Date(journey.deleted_on).toLocaleDateString()}
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
