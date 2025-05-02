'use client';


import Image from "next/image";
import Link from "next/link";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visit 1000 Hills</h1>
          <nav className="space-x-6">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/hotel" className="hover:underline">
              Hotels
            </Link>
            <Link href="/bus" className="hover:underline">
              Bus Tickets
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Carousel */}
      <Carousel
      autoPlay
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      showArrows={true}
    >
      {/* Slide 1 - Hotel Room with Tailwind Background */}
      <div className="relative h-[400px] bg-[url('/Images/slide1.jpg')] bg-center bg-cover">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Text */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <p className="text-white text-2xl font-semibold">
            <Link href="/hotel" className="underline">
              View Popular Hotel Rooms
            </Link>
          </p>
        </div>
      </div>

      {/* Slide 2 - Bus Route with Tailwind Background */}
      <div className="relative h-[400px] bg-[url('/Images/bus2.jpg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <p className="text-white text-2xl font-semibold">
            <Link href="/bus" className="underline">
              Explore Popular Bus Routes
            </Link>
          </p>
        </div>
      </div>

      {/* Slide 3 - Featured Hotel Room */}
      <div className="relative h-[400px] bg-[url('/Images/slide2.jpg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <p className="text-white text-2xl font-semibold">
            <Link href="/bus" className="underline">
              Explore Popular Apartments
            </Link>
          </p>
        </div>
      </div>

      {/* Slide 4 - Featured Bus Route */}
      <div className="relative h-[400px] bg-[url('/Images/slide4.jpg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <p className="text-white text-2xl font-semibold">
            <Link href="/bus" className="underline">
              Bus: Kigali to East Africa countries
            </Link>
          </p>
        </div>
      </div>
    </Carousel>

      {/* Search Bar */}
      <div className="bg-gray-100 py-6 px-4 flex justify-center">
        <input
          type="text"
          placeholder="Search hotels or bus routes..."
          className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 shadow-sm"
        />
      </div>

      {/* Featured Hotel Rooms */}
      <section className="py-10 px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Hotel Rooms</h2>
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
              <p className="text-gray-500">Kigali Marriott - $120/night</p>
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

      {/* Featured Bus Routes */}
      <section className="py-10 px-4 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-6 text-center">Popular Bus Routes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Kigali to Rubavu", "Kigali to Musanze", "Kigali to Huye"].map((route, index) => (
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
              <p className="text-gray-500">From $5</p>
              <Link
                href="/bus/1"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white text-center py-6 mt-10">
        <p>© 2025 Visit 1000 Hills. All rights reserved.</p>
      </footer>
    </div>
  );
}
