'use client';

import { useEffect, useState } from 'react';

interface Photo {
  id: number;
  path: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

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

  const openEditModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedApartment(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this apartment?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchApartments(page);
      } else {
        alert('Failed to delete apartment');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const imageBaseUrl = 'http://127.0.0.1:8000/storage';

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
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={
                      apartment.photos?.length > 0
                        ? `${imageBaseUrl}/${apartment.photos[0].path}`
                        : '/placeholder.jpg'
                    }
                    alt={apartment.name}
                    className="object-cover w-full h-full"
                  />
                  
                </div>
                <h2 className="text-xl font-semibold text-indigo-600">{apartment.name}</h2>
                <p className="text-md text-gray-500">{apartment.address}</p>
                <p className="text-gray-700 mt-2">Bedrooms: {apartment.number_of_bedroom}</p>
                <p className="text-gray-700">Kitchen Inside: {apartment.kitchen_inside ? 'Yes' : 'No'}</p>
                <p className="text-gray-700">Kitchen Outside: {apartment.kitchen_outside ? 'Yes' : 'No'}</p>
                <p className="text-gray-700">Floors: {apartment.number_of_floor}</p>

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

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => openEditModal(apartment)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(apartment.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {isModalOpen && selectedApartment && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Edit Apartment</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments/${selectedApartment.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(selectedApartment),
                    });
                    if (res.ok) {
                      closeModal();
                      fetchApartments(page);
                    } else {
                      alert('Failed to update apartment');
                    }
                  }}
                >
                  <input
                    type="text"
                    value={selectedApartment.name}
                    onChange={(e) => setSelectedApartment({ ...selectedApartment, name: e.target.value })}
                    className="w-full mb-4 border p-2"
                    placeholder="Apartment Name"
                  />
                  <input
                    type="text"
                    value={selectedApartment.address}
                    onChange={(e) => setSelectedApartment({ ...selectedApartment, address: e.target.value })}
                    className="w-full mb-4 border p-2"
                    placeholder="Address"
                  />
                  <input
                    type="number"
                    value={selectedApartment.number_of_bedroom}
                    onChange={(e) => setSelectedApartment({ ...selectedApartment, number_of_bedroom: Number(e.target.value) })}
                    className="w-full mb-4 border p-2"
                    placeholder="Number of Bedrooms"
                  />
                  <input
                    type="number"
                    value={selectedApartment.number_of_floor}
                    onChange={(e) => setSelectedApartment({ ...selectedApartment, number_of_floor: Number(e.target.value) })}
                    className="w-full mb-4 border p-2"
                    placeholder="Number of Floors"
                  />
                  <div className="mb-4 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedApartment.kitchen_inside}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, kitchen_inside: e.target.checked })}
                        className="mr-2"
                      />
                      Kitchen Inside
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedApartment.kitchen_outside}
                        onChange={(e) => setSelectedApartment({ ...selectedApartment, kitchen_outside: e.target.checked })}
                        className="mr-2"
                      />
                      Kitchen Outside
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
