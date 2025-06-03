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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRetreat, setEditRetreat] = useState<Retreat | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRetreatId, setDeleteRetreatId] = useState<number | null>(null);

  const [photoInputs, setPhotoInputs] = useState<File[]>([]);
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  const fetchRetreats = async (page: number) => {
    try {
      setLoading(true);

      const authToken = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats?page=${page}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });
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

  const handleEditClick = (retreat: Retreat) => {
    setEditRetreat(retreat);
    setPhotoInputs([]);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteRetreatId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteRetreatId) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${deleteRetreatId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete retreat');
      setShowDeleteModal(false);
      fetchRetreats(page);
    } catch (error) {
      console.error('Error deleting retreat:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editRetreat) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('title', editRetreat.title);
      formData.append('description', editRetreat.description);
      formData.append('address', editRetreat.address);
      formData.append('capacity', String(editRetreat.capacity));

      photoInputs.forEach((file) => {
        formData.append('photos[]', file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreats/${editRetreat.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update retreat');
      setShowEditModal(false);
      fetchRetreats(page);
    } catch (error) {
      console.error('Error updating retreat:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editRetreat) {
      setEditRetreat({ ...editRetreat, [e.target.name]: e.target.value });
    }
  };

  const handlePhotoChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newInputs = [...photoInputs];
      newInputs[index] = file;
      setPhotoInputs(newInputs);
    }
  };

  const addPhotoField = () => {
    setPhotoInputs([...photoInputs, new File([], '')]);
  };

  const handlePhotoDelete = async (photoId: number) => {
    if (!editRetreat) return;
    try {
      const authToken = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/retreat-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete photo');

      const updatedPhotos = editRetreat.photos.filter((p) => p.id !== photoId);
      setEditRetreat({ ...editRetreat, photos: updatedPhotos });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < lastPage && setPage(page + 1);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold mb-6">Retreat List</h1>

      {loading ? (
        <div className="text-center text-lg font-medium">Loading retreats...</div>
      ) : retreats.length === 0 ? (
        <div className="text-center text-lg font-medium">No retreats found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retreats.map((retreat) => (
              <div
                key={retreat.id}
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={
                      retreat.photos.length > 0
                        ? `${imageBaseUrl}/${retreat.photos[0].path}`
                        : '/placeholder.jpg'
                    }
                    alt={retreat.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-semibold text-indigo-700">{retreat.title}</h2>
                <p className="text-md text-gray-800">Address: {retreat.address}</p>
                <p className="text-md text-gray-800">Capacity: {retreat.capacity}</p>
                <p className="text-gray-900 mt-2">{retreat.description}</p>
                <div className="mt-2 text-sm space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={
                        retreat.status === 'available'
                          ? 'text-green-700 font-semibold'
                          : 'text-red-700 font-semibold'
                      }
                    >
                      {retreat.status || 'N/A'}
                    </span>
                  </div>
                  <div className="font-medium">Viewed: {retreat.viewed}</div>
                  {retreat.deleted_on && (
                    <div className="text-red-600 font-medium">
                      Deleted On: {new Date(retreat.deleted_on).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(retreat)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(retreat.id)}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-semibold">
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

      {showEditModal && editRetreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4">Edit Retreat</h2>
            <input
              type="text"
              name="title"
              value={editRetreat.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="description"
              value={editRetreat.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="address"
              value={editRetreat.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              name="capacity"
              value={editRetreat.capacity}
              onChange={handleInputChange}
              placeholder="Capacity"
              className="w-full p-2 border rounded mb-2"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Current Photo(s)</label>
              <div className="flex gap-2 flex-wrap">
                {editRetreat.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={`${imageBaseUrl}/${photo.path}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
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
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded"
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
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this retreat?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
