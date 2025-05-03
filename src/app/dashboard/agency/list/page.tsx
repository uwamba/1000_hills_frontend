'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

interface Agency {
  id: number;
  name: string;
  address: string;
  description: string;
  status: string;
  updated_by: number | null;
  deleted_by: number | null;
  deleted_on: string | null;
  updated_by_user?: User | null;
  deleted_by_user?: User | null;
}

export default function AgencyListPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies`);
        if (!res.ok) throw new Error('Failed to fetch agencies');

        const json = await res.json();
        const data: Agency[] = json.data || [];

        setAgencies(data);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Agency List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading agencies...</div>
      ) : agencies.length === 0 ? (
        <div className="text-center text-lg text-gray-500">No agencies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              <h2 className="text-2xl font-semibold text-indigo-600">{agency.name}</h2>
              <p className="text-md text-gray-500">{agency.address}</p>
              <p className="text-gray-700 mt-4">{agency.description}</p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={agency.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {agency.status}
                  </span>
                </div>

                {agency.updated_by_user && (
                  <div>
                    <span className="font-medium">Updated By:</span> {agency.updated_by_user.name}
                  </div>
                )}

                {agency.deleted_by_user && (
                  <div>
                    <span className="font-medium text-red-500">Deleted By:</span>{' '}
                    {agency.deleted_by_user.name}
                  </div>
                )}

                {agency.deleted_on && (
                  <div className="text-red-500">
                    <span className="font-medium">Deleted On:</span>{' '}
                    {new Date(agency.deleted_on).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
