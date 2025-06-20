"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // optional: use Heroicons or any other icon set

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold">Liva Trip</h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/roomList" className="hover:underline">Hotels Rooms</Link>
          <Link href="/busListing" className="hover:underline">Bus Tickets</Link>
          <Link href="/apartmentsListing" className="hover:underline">Apartment</Link>
          <Link href="/contact" className="hover:underline">Contact Us</Link>
          <Link href="/signin" className="hover:underline">Login</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-3 bg-blue-800">
          <Link href="/" className="block hover:underline">Home</Link>
          <Link href="/roomList" className="block hover:underline">Hotels Rooms</Link>
          <Link href="/busListing" className="block hover:underline">Bus Tickets</Link>
          <Link href="/apartmentsListing" className="block hover:underline">Apartment</Link>
          <Link href="/contact" className="block hover:underline">Contact Us</Link>
          <Link href="/signin" className="block hover:underline">Login</Link>
        </nav>
      )}
    </header>
  );
}
