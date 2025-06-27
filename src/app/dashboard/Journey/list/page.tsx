'use client';

import { useEffect, useState } from 'react';

interface Agency {
  id: number;
  name: string;
  address: string;
  description: string;
}
interface exchangeRate {
  currency_code: string;
  rate_to_usd: string;
}

interface Layout {
  id: number;
  name: string;
  row: number;
  column: number;
  seat_row: number;
  seat_column: number;
  exclude: string | null;
}

interface Bus {
  id: number;
  name: string;
  agency: Agency;
  layout: Layout;
}

interface Journey {
  id: number;
  route_id: number;
  from: string;
  to: string;
  departure: string;
  return: string;
  status: string | null;
  deleted_on: string | null;
  bus_id: number;
  bus: Bus | null;
  created_at: string;
  updated_at: string;
  time: string;
  price: string;
  currency: {
    currency_code: string;
    rate_to_usd: string;
  } | null;
  exchangeRate: exchangeRate | null;
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

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  const fetchJourneys = async (page: number) => {
    try {
      setLoading(true);
      const authToken = getAuthToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
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

  const toggleApproval = async (id: number, currentStatus: string | null) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      const authToken = getAuthToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      fetchJourneys(page);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this journey?')) return;

    try {
      const authToken = getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/journeys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete journey');
      fetchJourneys(page);
    } catch (error) {
      console.error('Error deleting journey:', error);
    }
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

                {journey.bus && (
                  <div className="mt-4 text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold">Bus:</span> {journey.bus.name}
                    </p>
                     <p>
                      <span className="font-semibold">Price:</span> {journey.price} {journey.currency?.currency_code || 'USD'}    
                    </p>
                    <p>
                      <span className="font-semibold">Agency:</span> {journey.bus.agency.name}
                    </p>
                    <p className="text-sm text-gray-600 ml-2">
                      <span className="font-medium">Address:</span> {journey.bus.agency.address}
                      <br />
                      <span className="font-medium">Description:</span> {journey.bus.agency.description}
                    </p>
                    <p>
                      <span className="font-semibold">Layout:</span> {journey.bus.layout.name}{' '}
                      ({journey.bus.layout.row}x{journey.bus.layout.column})
                    </p>
                    <p className="text-sm text-gray-600 ml-2">
                      <span className="font-medium">Seat Rows:</span> {journey.bus.layout.seat_row},{' '}
                      <span className="font-medium">Columns:</span> {journey.bus.layout.seat_column}
                      <br />
                      {journey.bus.layout.exclude && (
                        <span className="font-medium text-red-500">
                          Excluded: {journey.bus.layout.exclude}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={journey.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}
                    >
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

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleApproval(journey.id, journey.status)}
                    className={`px-3 py-1 text-white rounded ${
                      journey.status === 'approved' ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                  >
                    {journey.status === 'approved' ? 'Mark Pending' : 'Approve'}
                  </button>

                  <button
                    onClick={() => handleDelete(journey.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

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
