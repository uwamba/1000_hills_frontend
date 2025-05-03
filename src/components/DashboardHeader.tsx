'use client';

import { LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';

export default function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const username = "John Doe"; // Replace with actual user data

  return (
    <header className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 px-3 py-2 rounded"
        >
          <User size={20} className="text-gray-500" />
          {username}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-10">
            <a
              href="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <User size={16} /> Profile
            </a>
            <a
              href="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings size={16} /> Settings
            </a>
            <hr className="border-t border-gray-200" />
            <button
              onClick={() => {
                // Replace with your logout logic
                alert('Logging out...');
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
