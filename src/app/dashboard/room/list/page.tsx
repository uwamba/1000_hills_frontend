'use client';

import { useEffect, useState } from 'react';

interface Photo {
  id: number;
  path: string;
}

interface Room {
  id: number;
  name: string;
  price: number;
  capacity: number;
  description: string;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
}

interface RoomResponse {
  current_page: number;
  last_page: number;
  data: Room[];
}

export default function RoomListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);

  const [photoInputs, setPhotoInputs] = useState<File[]>([]);
  const imageBaseUrl = 'http://127.0.0.1:8000/storage';

  const fetchRooms = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const json: RoomResponse = await res.json();
      setRooms(json.data);
      setPage(json.current_page);
      setLastPage(json.last_page);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(page);
  }, [page]);

  const handleEditClick = (room: Room) => {
    setEditRoom(room);
    setPhotoInputs([]);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteRoomId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteRoomId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms/${deleteRoomId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete room');
      setShowDeleteModal(false);
      fetchRooms(page);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editRoom) return;
    try {
      const formData = new FormData();
      formData.append('name', editRoom.name);
      formData.append('price', String(editRoom.price));
      formData.append('capacity', String(editRoom.capacity));
      formData.append('description', editRoom.description);

      photoInputs.forEach((file) => {
        formData.append('photos[]', file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms/${editRoom.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update room');
      setShowEditModal(false);
      fetchRooms(page);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editRoom) {
      setEditRoom({ ...editRoom, [e.target.name]: e.target.value });
    }
  };

  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < lastPage && setPage(page + 1);

  const handlePhotoDelete = async (photoId: number) => {
    if (!editRoom) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/room-photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete photo');

      const updatedPhotos = editRoom.photos.filter((p) => p.id !== photoId);
      setEditRoom({ ...editRoom, photos: updatedPhotos });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-extrabold text-black mb-6">Room List</h1>

      {loading ? (
        <div className="text-center text-lg text-gray-800 font-medium">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-lg text-gray-800 font-medium">No rooms found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
              >
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={
                      room.photos.length > 0
                        ? `${imageBaseUrl}/${room.photos[0].path}`
                        : '/placeholder.jpg'
                    }
                    alt={room.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-semibold text-indigo-700">{room.name}</h2>
                <p className="text-md text-gray-800">Price: ${room.price}</p>
                <p className="text-md text-gray-800">Capacity: {room.capacity}</p>
                <p className="text-gray-900 mt-2">{room.description}</p>

                <div className="mt-2 text-sm text-gray-900 space-y-1">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={
                        room.status === 'available'
                          ? 'text-green-700 font-semibold'
                          : 'text-red-700 font-semibold'
                      }
                    >
                      {room.status || 'N/A'}
                    </span>
                  </div>
                  {room.deleted_on && (
                    <div className="text-red-600 font-medium">
                      <span className="font-medium">Deleted On:</span>{' '}
                      {new Date(room.deleted_on).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(room)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(room.id)}
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

      {showEditModal && editRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4">Edit Room</h2>
            <input
              type="text"
              name="name"
              value={editRoom.name}
              onChange={handleInputChange}
              placeholder="Room Name"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              name="price"
              value={editRoom.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              name="capacity"
              value={editRoom.capacity}
              onChange={handleInputChange}
              placeholder="Capacity"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="description"
              value={editRoom.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-2 border rounded mb-2"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-black">Current Photo(s)</label>
              <div className="flex gap-2 flex-wrap">
                {editRoom.photos.map((photo) => (
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
              <label className="block text-sm font-medium mb-2 text-black">Upload New Photo(s)</label>
              <div className="space-y-2">
                {photoInputs.map((_, index) => (
                  <input
                    key={index}
                    type="file"
                    accept="image/*"
                    name="photos"
                    onChange={(e) => handlePhotoChange(index, e)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded"
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
            <p className="mb-4">Are you sure you want to delete this room?</p>
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