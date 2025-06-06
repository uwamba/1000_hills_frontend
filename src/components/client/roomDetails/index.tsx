'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BookingForm from '../bookingForm';

import { useSearchParams } from 'next/navigation';



interface User {
  id: number;
  name: string;
}

interface Hotel {
  id: number;
  name: string;
}

interface Photo {
  id: number;
  path: string;
}

interface Room {
  id: number;
  name: string;
  type: string;
  has_wireless: boolean;
  bed_size: string;
  has_bathroom: boolean;
  price: number;
  currency: string;
  number_of_people: number;
  has_ac: boolean;
  has_swimming_pool?: boolean;
  has_laundry?: boolean;
  has_gym?: boolean;
  has_room_service?: boolean;
  has_sauna_massage?: boolean;
  has_kitchen?: boolean;
  has_fridge?: boolean;
  hotel: Hotel | null;
  status: string | null;
  deleted_on: string | null;
  updatedBy?: User | null;
  deletedBy?: User | null;
  photos?: Photo[];
}

export default function RoomDetailComponent() {
    const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const [room, setRoom] = useState<Room | null>(null);
  const [similarRooms, setSimilarRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
 const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  useEffect(() => {
    if (roomId) {
      const fetchRoom = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/rooms/${roomId}`);
          if (!res.ok) throw new Error('Failed to fetch room details');
          const data = await res.json();
          setRoom(data.room);
          setSimilarRooms(data.similarRooms || []);
        } catch (error) {
          console.error('Error loading room:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRoom();
    }
  }, [roomId]);

  if (loading) {
    return <div className="p-6 text-center text-lg text-gray-500">Loading room details...</div>;
  }

  if (!room) {
    return <div className="p-6 text-center text-lg text-red-500">Room not found.</div>;
  }

  const photos = room.photos || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">{room.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Image Gallery */}
        <div>
          <div className="w-full h-[400px] mb-4 rounded-xl overflow-hidden shadow-lg border border-gray-300">
            <img
              src={
                photos.length > 0
                  ? `${imageBaseUrl}/${photos[selectedImageIndex].path}`
                  : '/placeholder.jpg'
              }
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>

          {photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {photos.map((photo, index) => (
                <img
                  key={photo.id}
                  src={`${imageBaseUrl}/${photo.path}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 transition ${
                    selectedImageIndex === index
                      ? 'border-indigo-600 ring-2 ring-indigo-300'
                      : 'border-gray-300'
                  }`}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Room Info + Booking */}
        <div>
          <p className="text-lg text-gray-700 mb-3">{room.name}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
            <p><strong>Type:</strong> {room.type}</p>
            <p><strong>Bed Size:</strong> {room.bed_size}</p>
            <p><strong>Price:</strong> {room.price} {room.currency}</p>
            <p><strong>Capacity:</strong> {room.number_of_people} people</p>
            <p><strong>WiFi:</strong> {room.has_wireless ? 'Yes' : 'No'}</p>
            <p><strong>Bathroom:</strong> {room.has_bathroom ? 'Yes' : 'No'}</p>
            <p><strong>Air Conditioning:</strong> {room.has_ac ? 'Yes' : 'No'}</p>
            <p><strong>Swimming Pool:</strong> {room.has_swimming_pool ? 'Yes' : 'No'}</p>
            <p><strong>Laundry:</strong> {room.has_laundry ? 'Yes' : 'No'}</p>
            <p><strong>Gym:</strong> {room.has_gym ? 'Yes' : 'No'}</p>
            <p><strong>Room Service:</strong> {room.has_room_service ? 'Yes' : 'No'}</p>
            <p><strong>Sauna & Massage:</strong> {room.has_sauna_massage ? 'Yes' : 'No'}</p>
            <p><strong>Kitchen:</strong> {room.has_kitchen ? 'Yes' : 'No'}</p>
            <p><strong>Fridge:</strong> {room.has_fridge ? 'Yes' : 'No'}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={room.status === 'available' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {room.status || 'N/A'}
              </span>
            </p>
            {room.hotel && <p><strong>Hotel:</strong> {room.hotel.name}</p>}
            {room.updatedBy && <p><strong>Updated by:</strong> {room.updatedBy.name}</p>}
            {room.deletedBy && <p><strong>Deleted by:</strong> {room.deletedBy.name}</p>}
            {room.deleted_on && (
              <p className="text-red-500"><strong>Deleted on:</strong> {new Date(room.deleted_on).toLocaleString()}</p>
            )}
          </div>

          {/* Booking Form */}
          <div className="mt-6">
            <BookingForm
              propertyId={room.id.toString()}
              price={room.price ?? 0}
              object_type="room"
            />
          </div>
        </div>
      </div>

      {/* Similar Rooms */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Similar Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {similarRooms.length ? (
            similarRooms.map((similarRoom) => (
              <div key={similarRoom.id} className="bg-white rounded shadow-lg p-4">
                <img
                  src={`${imageBaseUrl}/${similarRoom.photos?.[0]?.path || '/placeholder.jpg'}`}
                  alt={similarRoom.name}
                  className="w-full h-48 object-cover rounded"
                />
                <h3 className="text-lg font-semibold text-indigo-700 mt-4">{similarRoom.name}</h3>
                <p className="text-gray-700">Price: {similarRoom.price} {similarRoom.currency}</p>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p>No similar rooms available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
