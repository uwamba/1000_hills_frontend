'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Photo {
  id: number;
  path: string;
  url: string;
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
  photos: Photo[];
}

interface RetreatResponse {
  current_page: number;
  last_page: number;
  data: Retreat[];
}

interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  photos: Photo[];
}

interface HotelResponse {
  current_page: number;
  last_page: number;
  data: Hotel[];
}

export default function Home() {
  const suggestions = [
    { text: "Hotel Rooms", link: "/roomList" },
    { text: "Apartment booking", link: "/apartmentsListing" },
    { text: "Bus ticketing", link: "/busListing" }
  ];

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<{ text: string, link: string }[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setFiltered(
      suggestions.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query]);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loadingRetreats, setLoadingRetreats] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL_STORAGE || 'http://localhost:3000/images';

  const fetchApartments = async () => {
    try {
      setLoadingApartments(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/apartments?page=1`);
      if (!res.ok) throw new Error('Failed to fetch apartments');
      const json: ApartmentResponse = await res.json();
      setApartments(json.data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoadingApartments(false);
    }
  };

  const fetchRetreats = async () => {
    try {
      setLoadingRetreats(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/retreats?page=1`);
      if (!res.ok) throw new Error('Failed to fetch retreats');
      const json: RetreatResponse = await res.json();
      setRetreats(json.data);
    } catch (error) {
      console.error('Error fetching retreats:', error);
    } finally {
      setLoadingRetreats(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingHotels(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/rooms?page=1`);
      if (!res.ok) throw new Error('Failed to fetch hotels');
      const json: HotelResponse = await res.json();
      setHotels(json.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoadingHotels(false);
    }
  };

  

  useEffect(() => {
    fetchApartments();
    fetchRetreats();
    fetchRooms();
  }, []);

  return (
    <>
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
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
          </span>
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
                  <li key={i} onClick={() => { setQuery(s.text); setOpen(false); }}
                    className="px-4 py-2 text-blue-800 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <Link href={s.link} className="inline-block text-blue-600 hover:underline">{s.text}</Link>
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
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Featured Hotel Rooms</h2>
        {loadingHotels ? (
          <p className="text-center text-gray-500">Loading Rooms...</p>
        ) : hotels.length === 0 ? (
          <p className="text-center text-gray-500">No Room found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {hotels.slice(0, 3).map((hotel) => (
              <Link
                key={hotel.id}
                href={`/hotels/${hotel.id}`}
                className="block border rounded-lg shadow hover:shadow-md p-4 text-center"
              >
                <img
                  src={
                    hotel.photos.length > 0
                      ? `${imageBaseUrl}/${hotel.photos[0].path}`
                      : "/placeholder.jpg"
                  }
                  alt={hotel.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-lg text-blue-800">{hotel.name}</h3>
                <p className="text-gray-700">{hotel.address}</p>
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
            {apartments.slice(0, 3).map((apartment) => (
              <Link
                key={apartment.id}
                href={`/apartments/${apartment.id}`}
                className="block border rounded-lg shadow hover:shadow-md p-4 text-center"
              >
                <img
                  src={
                    apartment.photos.length > 0
                      ? `${imageBaseUrl}/${apartment.photos[0].url}`
                      : "/placeholder.jpg"
                  }
                  alt={apartment.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-lg text-blue-800">{apartment.name}</h3>
                <p className="text-gray-700">{apartment.address}</p>
              </Link>
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
              <Link
                key={retreat.id}
                href={`/retreats/${retreat.id}`}
                className="block border rounded-lg shadow hover:shadow-md p-4 text-center"
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
                <h3 className="font-bold text-lg text-blue-800">{retreat.title}</h3>
                <p className="text-gray-700">{retreat.location}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
