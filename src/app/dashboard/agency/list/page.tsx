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
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);

  // Function to get the auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error('No auth token found.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this agency?')) return;

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Delete failed');

      setAgencies((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agencies/${editingAgency!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAgency),
      });

      if (!res.ok) throw new Error('Failed to update agency');

      const updatedAgency = await res.json();
      setAgencies((prev) =>
        prev.map((a) => (a.id === updatedAgency.data.id ? updatedAgency.data : a))
      );
      setEditingAgency(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

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

              {/* Edit/Delete Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingAgency(agency)}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(agency.id)}
                  className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Agency</h2>

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingAgency.name}
                  onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={editingAgency.address}
                  onChange={(e) =>
                    setEditingAgency({ ...editingAgency, address: e.target.value })
                  }
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingAgency.description}
                  onChange={(e) =>
                    setEditingAgency({ ...editingAgency, description: e.target.value })
                  }
                  className="w-full border rounded p-2"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAgency(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
