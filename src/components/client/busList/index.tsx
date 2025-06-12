'use client';

import { useEffect, useState } from 'react';
import TicketBookingForm from '../ticketBookingForm';

interface Agency {
  id: number;
  name: string;
  address: string;
  description: string;
}

interface Layout {
  id: number;
  name: string;
  row: number;
  column: number;
  seat_row: number;
  seat_column: number;
  exclude: number[] | null
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
  price?: number;
}

interface JourneyResponse {
  current_page: number;
  last_page: number;
  data: Journey[];
}

export default function BusList() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<Journey[]>([]);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [loading, setLoading] = useState(true);


  const fetchJourneys = async (pageNum: number) => {
  try {
    setLoading(true);

    const params = new URLSearchParams();


    if (selectedAgency) params.append('agency', selectedAgency);
    if (departureDate) params.append('departure_date', departureDate);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/journeys?${params.toString()}`
    );

    if (!response.ok) throw new Error('Failed to fetch journeys');
    const json: JourneyResponse = await response.json();

    const journeysWithPrice = json.data.map((j) => ({
      ...j,
    }));

    const agencyNames = Array.from(
      new Set(journeysWithPrice.map((j) => j.bus?.agency.name).filter(Boolean))
    ) as string[];

    setJourneys(journeysWithPrice);
    setFilteredJourneys(journeysWithPrice);
    setAgencies(agencyNames);

  } catch (error) {
    console.error('Error fetching journeys:', error);
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
  fetchJourneys(1); // Reset to first page on filter change
}, [selectedAgency, departureDate]);


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Available Journeys</h1>

      {/* Filters */}
      <div className="bg-blue-700 rounded-lg p-6 mb-8 shadow-sm">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            
            {/* Agency Filter */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="agency" className="text-sm font-semibold text-gray-700 mb-1">Agency</label>
              <select
                id="agency"
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">All Agencies</option>
                {agencies.map((agency) => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>

            {/* Departure Date Filter */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="departure" className="text-sm font-semibold text-gray-700 mb-1">Departure Date</label>
              <input
                id="departure"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end w-full md:w-auto">
              <button
                onClick={() => {
                  setSelectedAgency('');
                  setDepartureDate('');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full md:w-auto"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Cards */}
      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading...</div>
      ) : filteredJourneys.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No journeys match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJourneys.map((journey) => {
            const layout = journey.bus?.layout;
            let excludedSeats: number[] = [];


            return (
              <div key={journey.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-indigo-700">
                    {journey.from} ➡️ {journey.to}
                  </h2>
                 
                </div>

                <div className="text-gray-600 text-sm mb-2">
                  <strong className="text-gray-800">Agency:</strong> {journey.bus?.agency.name || '—'}
                </div>

                <div className="text-gray-600 text-sm mb-2">
                  <strong className="text-gray-800">Bus:</strong> {journey.bus?.name || '—'} |{' '}
                  <span className="text-gray-500 text-xs">{layout?.name}</span>
                </div>

                <div className="text-gray-600 text-sm mb-2">
                  <strong className="text-gray-800">Departure:</strong>{' '}
                  {new Date(journey.departure).toLocaleString()}
                </div>

                <div className="text-gray-700 text-lg mt-4 font-bold">
                  {journey.price?.toLocaleString()} RWF
                </div>



                <div className="mt-4">
                  <TicketBookingForm
                    propertyId={journey.id.toString()}
                    price={journey.price ?? 0}
                    object_type="ticket"
                    seatLayout={{
                      row: layout?.seat_row || 5,
                      seats_per_row: layout?.seat_column || 4,
                      exclude: layout?.exclude||[],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-10 flex justify-center items-center space-x-4">
       
      </div>
    </div>
  );
}
