"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import BookingRetreat from '../bookingRetreat';
import { Dialog } from '@headlessui/react';

interface Photo {
  id: number;
  path: string;
  url?: string;
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

interface Retreat {
  id: number;
  title: string;
  description: string;
  location: string;
  address: string;
  price_per_person: number;
  package_price: number;
  capacity: number;
  photos: Photo[];
}

interface RetreatResponse {
  current_page: number;
  last_page: number;
  data: Retreat[];
}

interface Room {
  id: number;
  name: string;
  price: number;
  type: string;
  capacity: number;
  description: string;
  status: string | null;
  deleted_on: string | null;
  photos: Photo[];
  hotel: Hotel | null;
}

interface Hotel {
  id: number;
  name: string;
  stars: string;
}

interface HotelResponse {
  current_page: number;
  last_page: number;
  data: Hotel[];
}

type PhotoItem = {
  type: "apartment" | "hotel" | "retreat";
  title: string;
  description?: string;
  location?: string;
  address?: string;
  photo: Photo;
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
   const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const suggestions = [
    { text: "Hotel Rooms", link: "/roomList" },
    { text: "Apartment booking", link: "/apartmentsListing" },
    { text: "Bus ticketing", link: "/busListing" },
  ];

   const openDetailModal = (retreat: Retreat) => {
      setSelectedRetreat(retreat);
      setSelectedPhotoIndex(0);
      setIsDetailModalOpen(true);
    };

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<{ text: string; link: string }[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loadingRetreats, setLoadingRetreats] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [selectedPhotoItem, setSelectedPhotoItem] = useState<PhotoItem | null>(null);

  const imageBaseUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || "http://localhost:3000/images";
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRetreat(null);
      };
    
      const handleBookNow = (retreat: Retreat) => {
        setSelectedRetreat(retreat);
        setIsDetailModalOpen(false);
        setIsBookingOpen(true);
      };
    
      const closeBookingModal = () => {
        setIsBookingOpen(false);
        setSelectedRetreat(null);
      };
    

  const fetchApartments = async () => {
    try {
      setLoadingApartments(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/featured-apartments`);
      const data = await res.json();
      setApartments(data);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    } finally {
      setLoadingApartments(false);
    }
  };

  const fetchRetreats = async () => {
    try {
      setLoadingRetreats(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/featured-events`);
      const data = await res.json();
      console.log(data)
      setRetreats(data);
    } catch (error) {
      console.error("Error fetching retreats:", error);
    } finally {
      setLoadingRetreats(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingHotels(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/featured-rooms`);
      if (!res.ok) throw new Error("Failed to fetch hotels");
      const data = await res.json();

      console.log(data)
  
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms([]); // fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setRooms([]); // fallback in case of fetch error
    } finally {
      setLoadingHotels(false);
    }
  };
  

  useEffect(() => {
    fetchRooms();
    fetchApartments();
    fetchRetreats();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setFiltered(suggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

  if (!isClient) return null;

  return (
    <>
      {/* Modal for Photo Details */}
      {selectedPhotoItem && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setSelectedPhotoItem(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedPhotoItem(null)}
            >
              &times;
            </button>
            <img
              src={`${imageBaseUrl}/${selectedPhotoItem.photo.url || selectedPhotoItem.photo.path}`}
              alt={selectedPhotoItem.title}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold text-blue-800 mb-2">{selectedPhotoItem.title}</h2>
            {selectedPhotoItem.address && (
              <p className="text-gray-700 mb-1">
                <strong>Address:</strong> {selectedPhotoItem.address}
              </p>
            )}
            {selectedPhotoItem.location && (
              <p className="text-gray-700 mb-1">
                <strong>Location:</strong> {selectedPhotoItem.location}
              </p>
            )}
            {selectedPhotoItem.description && (
              <p className="text-gray-700">
                <strong>Description:</strong> {selectedPhotoItem.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero Carousel */}
      <div className="relative flex h-[400px] w-full overflow-hidden">
        <div className="flex-1">
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} showArrows>
            <div className="h-[400px] bg-[url('/Images/slide1.jpg')] bg-center bg-cover relative">
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <p className="text-white text-2xl font-semibold">
                  <Link href="/hotel" className="underline">View Popular Hotel Rooms</Link>
                </p>
              </div>
            </div>
            <div className="h-[400px] bg-[url('/Images/bus2.jpg')] bg-center bg-cover relative">
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <p className="text-white text-2xl font-semibold">
                  <Link href="/bus" className="underline">Explore Bus Routes</Link>
                </p>
              </div>
            </div>
          </Carousel>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-30 -mt-[100px] mx-6 py-6 px-4 flex justify-center bg-blue-800 rounded-lg shadow-lg">
        <div ref={containerRef} className="relative w-full md:w-1/2">
          <input
            type="text"
            value={query}
            placeholder="Search hotels, apartments, or buses..."
            onFocus={() => setOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-white border border-gray-400 text-gray-700 placeholder-gray-500 shadow focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out"
          />
          {open && (
            <ul className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-50">
              {filtered.length > 0 ? (
                filtered.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setQuery(s.text);
                      setOpen(false);
                    }}
                    className="px-4 py-2 text-blue-800 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                    <Link href={s.link}>{s.text}</Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No matches</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Featured Hotels */}
     
     
      <section className="py-10 px-4 mx-[100px]">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">
        Featured Hotel Rooms
      </h2>
      {loadingHotels ? (
        <p className="text-center text-gray-500">Loading Rooms...</p>
      ) : rooms.length === 0 ? (
        <p className="text-center text-gray-500">No Room found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={{ pathname: "/roomList/more", query: { roomId: room.id } }}
              className="block bg-white rounded-lg shadow-lg p-4 border border-gray-300 hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                <img
                  src={
                    room.photos?.length > 0
                      ? `${imageBaseUrl}/${room.photos[0].path}`
                      : "/placeholder.jpg"
                  }
                  alt={room.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="text-xl font-semibold text-indigo-600">{room.name}</h2>
              <p className="text-gray-700 mt-2">{room.description}</p>
              <p className="text-gray-600 mt-1">Price: ${room.price}</p>
              <p className="text-gray-600 mt-1">Hotel: {room.hotel?.name}</p>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="text-green-600">{room.type || "N/A"}</span>
                </div>
                {room.deleted_on && (
                  <div className="text-red-500">
                    <span className="font-medium">Deleted On:</span>{" "}
                    {new Date(room.deleted_on).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>

      {/* Featured Apartments */}
      <section className="py-10 px-4 mx-[100px]">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Featured Apartments</h2>
        {loadingApartments ? (
          <p className="text-center text-gray-500">Loading apartments...</p>
        ) : apartments.length === 0 ? (
          <p className="text-center text-gray-500">No apartments found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="block border rounded-lg shadow hover:shadow-md p-4 text-center cursor-pointer"
                onClick={() =>
                  setSelectedPhotoItem({
                    type: "apartment",
                    title: apartment.name,
                    address: apartment.address,
                    photo: apartment.photos[0],
                  })
                }
              >
                <img 
                  src={
                    apartment.photos?.length > 0
                      ? `${imageBaseUrl}/${apartment.photos[0].path}`
                      : "/placeholder.jpg"
                  }
                  alt={apartment.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-lg text-blue-800">{apartment.name}</h3>
                <p className="text-gray-700">{apartment.address}</p>
                
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Retreats */}
      <section className="py-10 px-4 mx-[100px] bg-gray-50">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Featured Retreats</h2>
        {loadingRetreats ? (
          <p className="text-center text-gray-500">Loading retreats...</p>
        ) : retreats.length === 0 ? (
          <p className="text-center text-gray-500">No retreats found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {retreats.slice(0, 3).map((retreat) => (
              <div
                key={retreat.id}
                 className="bg-white rounded-lg shadow-lg p-4 border hover:shadow-2xl transform transition-transform hover:scale-105"
                onClick={() => openDetailModal(retreat)}
              >
                <img
                  src={
                    retreat.photos.length > 0
                      ? `${imageBaseUrl}/${retreat.photos[0].path}`
                      : "/placeholder.jpg"
                  }
                  alt={retreat.title}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h2 className="text-xl font-semibold text-indigo-600">{retreat.title}</h2>
                <p className="text-md text-gray-500">{retreat.address}</p>
                <p className="text-gray-600 mt-1">Price: ${retreat.capacity}</p>
                <p className="text-gray-600 mt-1">Price/Person: {retreat.price_per_person} </p>
                 <p className="text-gray-600 mt-1">Package Price: {retreat.package_price} </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => openDetailModal(retreat)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    See More Details
                  </button>
              </div>
              </div>
            ))}
          </div>
          
        )}
        
      </section>

            {/* Detail & Booking modals */}
            <Dialog open={isDetailModalOpen} onClose={closeDetailModal} className="relative z-50">
              <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
                <Dialog.Panel className="bg-white max-w-5xl w-full rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <Dialog.Title className="text-3xl font-bold text-indigo-700">
                      {selectedRetreat?.title}
                    </Dialog.Title>
                    <button
                      onClick={closeDetailModal}
                      className="text-gray-500 hover:text-gray-800 text-xl"
                    >
                      ✕
                    </button>
                  </div>
      
                  <p className="text-gray-600 mb-4">{selectedRetreat?.address}</p>
      
                  {selectedRetreat?.photos?.length ? (
                    <div className="mb-6">
                      <div className="w-full h-96 mb-4 rounded overflow-hidden border">
                        <img
                          src={
                            selectedRetreat.photos?.[selectedPhotoIndex]
                              ? `${imageBaseUrl}/${selectedRetreat.photos[selectedPhotoIndex].path}`
                              : '/placeholder.jpg'
                          }
                          alt="Main"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedRetreat.photos.map((photo, index) => (
                          <img
                            key={photo.id}
                            src={`${imageBaseUrl}/${photo.path}`}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${index === selectedPhotoIndex
                              ? 'border-indigo-500'
                              : 'border-gray-200 hover:border-gray-400'
                              }`}
                            alt={`Thumbnail ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
      
      
                  {selectedRetreat && (
                    <div className="mt-6">
                      <button
                        onClick={() => handleBookNow(selectedRetreat)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Book Now
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </div>
            </Dialog>
      
            {selectedRetreat && (
              <BookingRetreat
                isOpen={isBookingOpen}
                onClose={closeBookingModal}
                retreatId={selectedRetreat.id}
                retreatTitle={selectedRetreat.title}
              />
            )}

            
      
    </>
    
    
    
    
  );
  
  
}
