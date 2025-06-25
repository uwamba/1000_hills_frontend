"use client";

import { useEffect, useState } from "react";
import {
  Building2, Home, Landmark, BedDouble, Users2, ClipboardList, CalendarDays, CalendarCheck2,
  Ban, DollarSign, BusFront, Map, UserCog, ActivitySquare
} from "lucide-react";

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("No auth token found");
          return;
        }
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading statistics...
      </div>
    );
  }

  const sections = [
    {
      title: "📦 Bookings & Activity",
      items: [
        { label: "Total Bookings", value: stats.bookings, icon: <ClipboardList className="text-blue-600" /> },
        { label: "Active Bookings", value: stats.active_bookings, icon: <CalendarCheck2 className="text-green-600" /> },
        { label: "Cancelled Bookings", value: stats.cancelled_bookings, icon: <Ban className="text-red-500" /> },
        { label: "This Week", value: stats.bookings_week, icon: <CalendarDays className="text-indigo-500" /> },
        { label: "This Month", value: stats.bookings_month, icon: <CalendarDays className="text-cyan-500" /> },
      ],
    },
    {
      title: "🏨 Locations & Infrastructure",
      items: [
        { label: "Hotels", value: stats.hotels, icon: <Building2 className="text-blue-600" /> },
        { label: "Apartments", value: stats.apartments, icon: <Home className="text-purple-600" /> },
        { label: "Rooms", value: stats.rooms, icon: <BedDouble className="text-pink-600" /> },
        { label: "Agencies", value: stats.agencies, icon: <Landmark className="text-green-600" /> },
        { label: "Journeys", value: stats.journeys, icon: <Map className="text-orange-600" /> },
        { label: "Buses", value: stats.buses, icon: <BusFront className="text-amber-500" /> },
      ],
    },
    {
      title: "👥 Users & Admins",
      items: [
        { label: "Clients", value: stats.clients, icon: <Users2 className="text-gray-700" /> },
        { label: "Admins", value: stats.total_admins, icon: <UserCog className="text-teal-600" /> },
      ],
    },
    {
      title: "💰 Payments",
      items: [
        {
          label: "Total Payments",
          value: `$${Number(stats.total_payments || stats.payments_total || 0).toLocaleString()}`,
          icon: <DollarSign className="text-yellow-500" />,
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">📊 Dashboard Overview</h1>

      {sections.map((section, idx) => (
        <div key={idx} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {section.items.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow p-5 flex justify-between items-center hover:shadow-lg transition-shadow"
              >
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">{card.icon}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📈 Activity Trend (Coming Soon)</h2>
        <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          Booking & Payment Chart Placeholder
        </div>
      </div>
    </div>
  );
}
