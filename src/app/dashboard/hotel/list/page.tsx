'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';

interface Photo {
  id: number;
  path: string;
}

interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  stars: number;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
}

interface HotelResponse {
  current_page: number;
  last_page: number;
  data: Hotel[];
}

export default function HotelListPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [photoInputs, setPhotoInputs] = useState<File[]>([]);

  const fetchHotels = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch hotels');
      const json: HotelResponse = await res.json();
      setHotels(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels(page);
  }, [page]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < lastPage && setPage(page + 1);

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedHotel) return;

    const formData = new FormData(e.currentTarget);
    formData.append('_method', 'PUT');

    photoInputs.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels/${selectedHotel.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update hotel');
      setIsEditModalOpen(false);
      setPhotoInputs([]);
      fetchHotels(page);
    } catch (error) {
      console.error('Error updating hotel:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotels/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete hotel');
      fetchHotels(page);
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  };

  const handlePhotoDelete = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete photo');

      if (selectedHotel) {
        setSelectedHotel({
          ...selectedHotel,
          photos: selectedHotel.photos.filter((photo) => photo.id !== photoId),
        });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePhotoChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const updated = [...photoInputs];
    updated[index] = files[0];
    setPhotoInputs(updated);
  };

  const addPhotoField = () => {
    setPhotoInputs([...photoInputs, new File([], '')]);
  };

 const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold text-black mb-6">Hotel List</h1>

      {/* Hotel Listing */}
      {loading ? (
        <div className="text-center text-lg text-gray-800 font-medium">Loading hotels...</div>
      ) : hotels.length === 0 ? (
        <div className="text-center text-lg text-gray-800 font-medium">No hotels found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={hotel.photos.length > 0 ? `${imageBaseUrl}/${hotel.photos[0].path}` : '/placeholder.jpg'}
                    alt={hotel.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-semibold text-indigo-700">{hotel.name}</h2>
                <p className="text-md text-gray-800">{hotel.address}</p>
                <p className="text-gray-900 mt-2">{hotel.description}</p>
                <p className="text-gray-800 mt-1">Stars: {hotel.stars}</p>
                <div className="mt-2 text-sm text-gray-900 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={hotel.status === 'active' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {hotel.status || 'N/A'}
                    </span>
                  </div>
                  {hotel.deleted_on && (
                    <div className="text-red-600 font-medium">
                      <span className="font-medium">Deleted On:</span> {new Date(hotel.deleted_on).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setPhotoInputs([]);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel.id)}
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
      {isEditModalOpen && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg overflow-y-auto max-h-screen text-black">
            <h2 className="text-2xl font-bold mb-4">Edit Hotel</h2>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <input name="name" defaultValue={selectedHotel.name} className="w-full p-2 mb-2 border text-black" />
              <input name="address" defaultValue={selectedHotel.address} className="w-full p-2 mb-2 border text-black" />
              <textarea name="description" defaultValue={selectedHotel.description} className="w-full p-2 mb-2 border text-black" />
              <input name="stars" type="number" defaultValue={selectedHotel.stars} className="w-full p-2 mb-2 border text-black" />
              <select name="status" defaultValue={selectedHotel.status || ''} className="w-full p-2 mb-4 border text-black">
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Existing Photos */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">Current Photo(s)</label>
                <div className="flex gap-2 flex-wrap">
                  {selectedHotel.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img src={`${imageBaseUrl}/${photo.path}`} className="w-24 h-24 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => handlePhotoDelete(photo.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Photos Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black">Upload New Photo(s)</label>
                <div className="space-y-2">
                  {photoInputs.map((_, index) => (
                    <input
                      key={index}
                      type="file"
                      accept="image/*"
                      name="photos"
                      onChange={(e) => handlePhotoChange(index, e)}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                                 file:rounded file:border-0 file:text-sm file:font-semibold
                                 file:bg-blue-50 file:text-blue-700
                                 hover:file:bg-blue-100 border border-gray-300 rounded"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPhotoField}
                  className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  + Add Another Photo
                </button>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setPhotoInputs([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
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
    </div>
  );
}
