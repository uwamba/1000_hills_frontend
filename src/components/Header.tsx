"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Visit 1000 Hills</h1>
        <nav className="space-x-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/roomList" className="hover:underline">Hotels Room List</Link>
          <Link href="/bus" className="hover:underline">Bus Tickets</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
