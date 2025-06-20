"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Liva Trip</h1>
        <nav className="space-x-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/roomList" className="hover:underline">Hotels Rooms</Link>
          <Link href="/busListing" className="hover:underline">Bus Tickets</Link>
          <Link href="/apartmentsListing" className="hover:underline">Apartment</Link>
          <Link href="/contact" className="hover:underline">Contact Us</Link>
          <Link href="/signin" className="hover:underline">Login</Link>
        </nav>
      </div>
    </header>
  );
}
