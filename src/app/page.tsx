"use client";


import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function HomePage() {
  // === Suggestion state ===
  const suggestions = ["Hotel booking", "Apartment booking", "Bus ticketing"];
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    setFiltered(
      suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Navigation */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visit 1000 Hills</h1>
          <nav className="space-x-6">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/hotel" className="hover:underline">Hotels</Link>
            <Link href="/bus" className="hover:underline">Bus Tickets</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Carousel */}
      <div className="relative flex h-[400px] w-full overflow-hidden">
        <div className="flex-1">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showArrows
          >
            
              {/* Slide 1 */}
              <div className="h-[400px] bg-[url('/Images/slide1.jpg')] bg-center bg-cover relative">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <p className="text-white text-2xl font-semibold">
                    <Link href="/hotel" className="underline">
                      View Popular Hotel Rooms
                    </Link>
                  </p>
                </div>
              </div>
              {/* Slide 2 */}
              <div className="h-[400px] bg-[url('/Images/bus2.jpg')] bg-center bg-cover relative">
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <p className="text-white text-2xl font-semibold">
                    <Link href="/bus" className="underline">
                      Explore Bus Routes
                    </Link>
                  </p>
                </div>
              </div>
            
          </Carousel>
        </div>
      </div>

      {/* Search Bar (overlapping Carousel) with Suggestions */}
      <div className="relative z-30 -mt-[100px] mx-6 py-6 px-4 flex justify-center bg-blue-800 rounded-lg shadow-lg">
        <div ref={containerRef} className="relative w-full md:w-1/2">
          {/* Icon */}
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>
          </span>

          {/* Text Input */}
          <input
            type="text"
            value={query}
            placeholder="Search hotels, apartments, or buses..."
            onFocus={() => setOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full
              p-3
              pl-10
              rounded-lg
              bg-white
              border
              border-gray-400
              text-gray-700
              placeholder-gray-500
              shadow
              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:border-transparent
              transition
              duration-150
              ease-in-out
            "
          />

          {/* Dropdown */}
          {open && (
            <ul className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-50">
              {filtered.length > 0 ? (
                filtered.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setQuery(s);
                      setOpen(false);
                    }}
                    className="px-4 py-2 text-blue-800 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                     <Link
                href="/hotel/1"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                 {s}
              </Link>
                   
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No matches</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Featured Hotel Rooms */}
      <section className="py-10 px-4 mx-[100px]">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">
          Featured Hotel Rooms
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border rounded-lg shadow hover:shadow-md p-4 text-center"
            >
              <Image
                src="/Images/suite.jpeg"
                alt="Hotel Room"
                width={400}
                height={250}
                className="rounded-lg object-cover"
              />
              <h3 className="mt-4 font-bold text-lg">Deluxe Room {item}</h3>
              <p className="text-gray-700">Kigali Marriott - $120/night</p>
              <Link
                href="/hotel/1"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Bus Routes */}
      <section className="py-10 px-4 mx-[100px] bg-gray-50">
        <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">
          Popular Bus Routes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Kigali to Rubavu", "Kigali to Musanze", "Kigali to Huye"].map(
            (route, index) => (
              <div
                key={index}
                className="border rounded-lg shadow hover:shadow-md p-4 text-center"
              >
                <Image
                  src="/Images/bus.jpg"
                  alt="Bus"
                  width={400}
                  height={250}
                  className="rounded-lg object-cover"
                />
                <h3 className="mt-4 font-bold text-lg">{route}</h3>
                <p className="text-gray-700">From $5</p>
                <Link
                  href="/bus/1"
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  Book Now
                </Link>
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-6 mt-10">
        <p>© 2025 Visit 1000 Hills. All rights reserved.</p>
      </footer>
    </div>
  );
}