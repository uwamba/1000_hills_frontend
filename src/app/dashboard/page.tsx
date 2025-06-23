"use client";

import { useEffect, useState } from "react";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    hotels: 0,
    agencies: 0,
    apartments: 0,
  });

  // Replace with your actual API call
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard-stats`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback demo values
        setStats({ hotels: 12, agencies: 5, apartments: 18 });
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-black">Total Hotels</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.hotels}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-black">Total Agencies</h2>
          <p className="text-3xl font-bold text-green-600">{stats.agencies}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-black">Total Apartments</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.apartments}</p>
        </div>
      </div>
    </div>
  );
}

  