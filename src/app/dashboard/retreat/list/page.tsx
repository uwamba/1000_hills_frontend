'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';

interface Photo {
  id: number;
  path: string;
}

interface Retreat {
  id: number;
  title: string;
  description: string;
  address: string;
  capacity: number;
  status: string | null;
  viewed: number;
  deleted_on: string | null;
  photos: Photo[];
}

interface RetreatResponse {
  current_page: number;
  last_page: number;
  data: Retreat[];
}

export default function RetreatListPage() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const [photoInputs, setPhotoInputs] = useState<File[]>([]);

  const imageBaseUrl = 'http://127.0.0.1:8000/storage';

  const fetchRetreats = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch retreats');
      const json: RetreatResponse = await res.json();
      setRetreats(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching retreats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetreats(page);
  }, [page]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < lastPage && setPage(page + 1);

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRetreat) return;

    const formData = new FormData(e.currentTarget);
    formData.append('_method', 'PUT');

    photoInputs.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${selectedRetreat.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update retreat');
      setIsEditModalOpen(false);
      setPhotoInputs([]);
      fetchRetreats(page);
    } catch (error) {
      console.error('Error updating retreat:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this retreat?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete retreat');
      fetchRetreats(page);
    } catch (error) {
      console.error('Error deleting retreat:', error);
    }
  };

  const handlePhotoDelete = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete photo');

      if (selectedRetreat) {
        setSelectedRetreat({
          ...selectedRetreat,
          photos: selectedRetreat.photos.filter((photo) => photo.id !== photoId),
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold text-black mb-6">Retreat List</h1>

      {loading ? (
        <div>Loading retreats...</div>
      ) : retreats.length === 0 ? (
        <div>No retreats found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retreats.map((retreat) => (
              <div key={retreat.id} className="bg-white p-4 rounded shadow">
                <img
                  src={retreat.photos[0] ? `${imageBaseUrl}/${retreat.photos[0].path}` : '/placeholder.jpg'}
                  className="w-full h-48 object-cover rounded"
                />
                <h2 className="text-xl font-bold mt-2">{retreat.title}</h2>
                <p>{retreat.address}</p>
                <p>{retreat.description}</p>
                <p>Capacity: {retreat.capacity}</p>
                <p>Status: {retreat.status ?? 'N/A'}</p>
                <p>Viewed: {retreat.viewed}</p>
                {retreat.deleted_on && <p className="text-red-600">Deleted On: {new Date(retreat.deleted_on).toLocaleDateString()}</p>}

                <div className="mt-2 flex space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelectedRetreat(retreat);
                      setPhotoInputs([]);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(retreat.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button onClick={handlePrev} disabled={page === 1} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
              Previous
            </button>
            <span>Page {page} of {lastPage}</span>
            <button onClick={handleNext} disabled={page === lastPage} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
              Next
            </button>
          </div>
        </>
      )}

      {isEditModalOpen && selectedRetreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg overflow-y-auto max-h-screen text-black">
            <h2 className="text-2xl font-bold mb-4">Edit Retreat</h2>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <input name="title" defaultValue={selectedRetreat.title} className="w-full p-2 mb-2 border" />
              <input name="address" defaultValue={selectedRetreat.address} className="w-full p-2 mb-2 border" />
              <textarea name="description" defaultValue={selectedRetreat.description} className="w-full p-2 mb-2 border" />
              <input name="capacity" type="number" defaultValue={selectedRetreat.capacity} className="w-full p-2 mb-2 border" />
              <select name="status" defaultValue={selectedRetreat.status ?? ''} className="w-full p-2 mb-4 border">
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Existing Photos */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Current Photo(s)</label>
                <div className="flex gap-2 flex-wrap">
                  {selectedRetreat.photos.map((photo) => (
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

              {/* Upload new photos */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload New Photo(s)</label>
                <div className="space-y-2">
                  {photoInputs.map((_, index) => (
                    <input
                      key={index}
                      type="file"
                      accept="image/*"
                      name="photos"
                      onChange={(e) => handlePhotoChange(index, e)}
                      className="block w-full border rounded p-1"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPhotoField}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                >
                  + Add Another Photo
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setPhotoInputs([]);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
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
