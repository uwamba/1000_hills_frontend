'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';

interface ApartmentOwner {
  id: number;
  name: string;
  address: string;
  contract_path: string | null;
  status: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

interface ApartmentOwnerResponse {
  current_page: number;
  last_page: number;
  data: ApartmentOwner[];
}

export default function ApartmentOwnerListPage() {
  const [owners, setOwners] = useState<ApartmentOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<ApartmentOwner | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  // Get auth token from localStorage (or adjust if using cookies or another auth method)
  const authToken =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchOwners = async (pageNum: number) => {
    if (!authToken) {
      console.warn('No auth token found');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/apartment-owners?page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch owners (${res.status})`);
      }
      const json: ApartmentOwnerResponse = await res.json();
      setOwners(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching apartment owners:', error);
      // Optionally show user-friendly error UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOwners(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, authToken]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < lastPage) setPage(page + 1);
  };

  const handleEditClick = (owner: ApartmentOwner) => {
    setSelectedOwner(owner);
    setContractFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOwner) return;
    if (!authToken) {
      console.warn('No auth token');
      return;
    }
    const formData = new FormData();
    // Append fields that can be updated
    const form = e.currentTarget;
    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    const addressInput = form.querySelector<HTMLInputElement>(
      'input[name="address"]'
    );
    const statusSelect = form.querySelector<HTMLSelectElement>(
      'select[name="status"]'
    );

    if (nameInput) formData.append('name', nameInput.value);
    if (addressInput) formData.append('address', addressInput.value);
    if (statusSelect) formData.append('status', statusSelect.value);

    // If replacing contract file
    if (contractFile) {
      formData.append('contract', contractFile);
    }

    // Use method spoofing for PUT
    formData.append('_method', 'PUT');

    try {
      const res = await fetch(
        `${apiBase}/apartment-owners/${selectedOwner.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to update owner (${res.status})`);
      }
      // Close modal and refresh list
      setIsEditModalOpen(false);
      setContractFile(null);
      fetchOwners(page);
    } catch (error) {
      console.error('Error updating apartment owner:', error);
      // Optionally show error feedback
    }
  };

  const handleDelete = async (id: number) => {
    if (!authToken) return;
    if (!confirm('Are you sure you want to delete this apartment owner?')) return;
    try {
      const res = await fetch(`${apiBase}/apartment-owners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to delete (status ${res.status})`);
      // After deletion, refetch current page; if last item on last page removed, you may want to go to previous page
      // Simple approach: refetch current page
      fetchOwners(page);
    } catch (error) {
      console.error('Error deleting apartment owner:', error);
    }
  };

  const handleContractChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setContractFile(files[0]);
    }
  };

  // Base URL to serve files; adjust if you serve contracts differently
  const fileBaseUrl =
    process.env.NEXT_PUBLIC_FILE_BASE_URL_STORAGE ||
    process.env.NEXT_PUBLIC_API_BASE_URL; // or another storage URL

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold text-black mb-6">
        Apartment Owners
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-800 font-medium">
          Loading apartment owners...
        </div>
      ) : owners.length === 0 ? (
        <div className="text-center text-lg text-gray-800 font-medium">
          No apartment owners found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owners.map((owner) => (
              <div
                key={owner.id}
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-indigo-700">
                  {owner.name}
                </h2>
                <p className="text-md text-gray-800">{owner.address}</p>
                <div className="mt-2 text-sm text-gray-900 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={
                        owner.status === 'active'
                          ? 'text-green-700 font-semibold'
                          : 'text-red-700 font-semibold'
                      }
                    >
                      {owner.status || 'N/A'}
                    </span>
                  </div>
                  {owner.contract_path && (
                    <div className="text-blue-700">
                      <span className="font-medium">Contract:</span>{' '}
                      <a
                        href={`${fileBaseUrl}/${owner.contract_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View / Download
                      </a>
                    </div>
                  )}
                  <div className="text-gray-600 text-xs">
                    Created:{' '}
                    {new Date(owner.created_at).toLocaleDateString()}{' '}
                    {new Date(owner.created_at).toLocaleTimeString()}
                  </div>
                  <div className="text-gray-600 text-xs">
                    Updated:{' '}
                    {new Date(owner.updated_at).toLocaleDateString()}{' '}
                    {new Date(owner.updated_at).toLocaleTimeString()}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(owner)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(owner.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
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
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-black font-semibold">
              Page {page} of {lastPage}
            </span>
            <button
              onClick={handleNext}
              disabled={page === lastPage}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg overflow-y-auto max-h-screen text-black">
            <h2 className="text-2xl font-bold mb-4">Edit Apartment Owner</h2>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <label className="block mb-1 font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                defaultValue={selectedOwner.name}
                className="w-full p-2 mb-2 border text-black rounded"
                required
              />

              <label className="block mb-1 font-medium text-gray-700">
                Address
              </label>
              <input
                name="address"
                defaultValue={selectedOwner.address}
                className="w-full p-2 mb-2 border text-black rounded"
                required
              />

              <label className="block mb-1 font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                defaultValue={selectedOwner.status || ''}
                className="w-full p-2 mb-4 border text-black rounded"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Existing Contract */}
              {selectedOwner.contract_path && (
                <div className="mb-4 text-gray-800">
                  <label className="block text-sm font-medium mb-1 text-black">
                    Current Contract
                  </label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`${fileBaseUrl}/${selectedOwner.contract_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View / Download
                    </a>
                    {/* If you want to allow deleting contract alone, you could add a button here
                        that calls an API endpoint to remove/clear the contract_path. */}
                  </div>
                </div>
              )}

              {/* New Contract Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Upload New Contract (optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  name="contract"
                  onChange={handleContractChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                             file:rounded file:border-0 file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setContractFile(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
