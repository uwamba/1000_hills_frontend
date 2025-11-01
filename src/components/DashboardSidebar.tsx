"use client";

import { useState, useEffect, JSX } from "react";
import Link from "next/link";
import {
  Home,
  BarChart2,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Shield,
  Folder,
  BedDouble,
  List,
  CalendarCheck,
  CreditCard,
  Bus,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function DashboardSidebar() {
  const [openManagement, setOpenManagement] = useState(false);
  const [openHotel, setOpenHotel] = useState(false);
  const [openBus, setOpenBus] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openApartments, setOpenApartments] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [objectName, setObjectName] = useState<string>("");
  const [openExchangeRateManagement, setOpenExchangeRateManagement] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const storedUserType = localStorage.getItem("userType");
    const storedObjectManagement = localStorage.getItem("objectManagementType");
  

    setUserType(storedUserType || "guest");

    if (storedObjectManagement) {
      try {
        const parsed = JSON.parse(storedObjectManagement);
        console.log("Parsed objectManagementType:", parsed);

        if (Array.isArray(parsed) && parsed.length > 0) {
          // Extract the first object's "object" field as a string
          setObjectName(parsed[0].object || "");
        }
      } catch (e) {
        console.error("Invalid objectManagementType format", e);
      }
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const displayName =
          parsedUser.username?.trim() !== ""
            ? parsedUser.username
            : parsedUser.email || "User";
        setUsername(displayName);
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
  }, []);

  return (
    <aside className="w-64 h-screen overflow-y-auto bg-gray-900 text-white p-4 space-y-6">
      <div className="text-2xl font-bold mb-6">🌟 Dashboard</div>
      <div className="text-sm text-gray-300 mb-4">Logged in as: {username}</div>

      <nav className="space-y-3">
        <SidebarItem href="/dashboard" icon={<Home size={20} />} label="Home" />

        {userType === "admin" && (
          <SidebarItem href="/dashboard/analytics" icon={<BarChart2 size={20} />} label="Analytics" />
        )}

        {userType === "admin" && (
          <SidebarGroup
            label="User Management"
            icon={<Users size={20} />}
            open={openManagement}
            toggle={() => setOpenManagement(!openManagement)}
          >
            <SidebarSubItem href="/dashboard/users/list" label="User List" icon={<List size={16} />} />
            <SidebarSubItem href="/dashboard/users/add" label="Add New User" icon={<UserPlus size={16} />} />
            <SidebarSubItem href="/dashboard/roles" label="Roles Management" icon={<Shield size={16} />} />
            <SidebarSubItem href="/dashboard/projects" label="Projects" icon={<Folder size={16} />} />
          </SidebarGroup>
        )}

        {userType === "admin" && (
          <SidebarGroup
            label="Exchange Rate Management"
            icon={<Users size={20} />}
            open={openExchangeRateManagement}
            toggle={() => setOpenExchangeRateManagement(!openExchangeRateManagement)}
          >
            <SidebarSubItem href="/dashboard/exchange" label="Currency List" icon={<List size={16} />} />
          </SidebarGroup>
        )}

        {userType === "admin" && (
          <SidebarGroup
            label="Settings"
            icon={<Settings size={20} />}
            open={openSettings}
            toggle={() => setOpenSettings(!openSettings)}
          >
            <SidebarSubItem href="/dashboard/profile" label="Profile" />
            <SidebarSubItem href="/dashboard/preferences" label="Preferences" />
          </SidebarGroup>
        )}

         {objectName.includes("apartment") || userType === "admin" && (
              <SidebarGroup
                label="Apartment Management"
                icon={<BedDouble size={16} />}
                open={openApartments}
                toggle={() => setOpenApartments(!openApartments)}
              >
               
                <SidebarSubItem href="/dashboard/apartmentOwner/add" label="Add New Apartment Owner" icon={<BedDouble size={16} />} />
                <SidebarSubItem href="/dashboard/apartmentOwner/list" label="Apartment Owner List" icon={<BedDouble size={16} />} />
                <SidebarSubItem href="/dashboard/apartment/add" label="Add New Apartment" icon={<BedDouble size={16} />} />
                <SidebarSubItem href="/dashboard/apartment/list" label="Apartment List" icon={<List size={16} />} />
                <SidebarSubItem href="/dashboard/apartment/booking" label="Apartment Booking" icon={<CalendarCheck size={16} />} />
                <SidebarSubItem href="/dashboard/apartment/payment" label="Apartment Payment" icon={<CreditCard size={16} />} />
              </SidebarGroup>
            )}

        {objectName.includes("hotel") || userType === "admin" && (
          <SidebarGroup
            label="Hotel Management"
            icon={<Folder size={20} />}
            open={openHotel}
            toggle={() => setOpenHotel(!openHotel)}
          >
           

           
           {objectName.includes("hotel") || userType === "admin" && (
            <SidebarGroup
              label="Hotel Room Management"
              icon={<Folder size={16} />}
              open={openRoom}
              toggle={() => setOpenRoom(!openRoom)}
            >
              <SidebarSubItem href="/dashboard/hotel/add" label="Add New Hotel" icon={<BedDouble size={16} />} />
               <SidebarSubItem href="/dashboard/hotel/list" label="Hotel List" icon={<List size={16} />} />
              <SidebarSubItem href="/dashboard/room/add" label="Add New Room" icon={<BedDouble size={16} />} />
              <SidebarSubItem href="/dashboard/room/list" label="Hotel Room List" icon={<List size={16} />} />
              <SidebarSubItem href="/dashboard/room/payment" label="Hotel Room Payment" icon={<CreditCard size={16} />} />
              <SidebarSubItem href="/dashboard/room/booking" label="Hotel Room Booking" icon={<CalendarCheck size={16} />} />
            </SidebarGroup>
          )}
          </SidebarGroup>
        )}

        {objectName.includes("agence") || userType === "admin" && (
          <SidebarGroup
            label="Bus Agency Management"
            icon={<Folder size={20} />}
            open={openBus}
            toggle={() => setOpenBus(!openBus)}
          >
            <SidebarSubItem href="/dashboard/bus/layout-add" label="Add Bus Layout" icon={<Bus size={16} />} />
            <SidebarSubItem href="/dashboard/bus/layout-list" label="Bus Layout List" icon={<List size={16} />} />
            <SidebarSubItem href="/dashboard/agency/add" label="Add New Agency" icon={<BedDouble size={16} />} />
            <SidebarSubItem href="/dashboard/agency/list" label="Agency List" icon={<List size={16} />} />
            <SidebarSubItem href="/dashboard/bus/add" label="Add new bus" icon={<Bus size={16} />} />
            <SidebarSubItem href="/dashboard/bus/list" label="Bus list" icon={<List size={16} />} />
            <SidebarSubItem href="/dashboard/bus/booking" label="Bus Booking" icon={<CalendarCheck size={16} />} />
            <SidebarSubItem href="/dashboard/bus/payment" label="View payments" icon={<CreditCard size={16} />} />
            <SidebarSubItem href="/dashboard/Journey/Add" label="Add new Journey" icon={<CalendarCheck size={16} />} />
            <SidebarSubItem href="/dashboard/Journey/list" label="Journey list" icon={<List size={16} />} />
          </SidebarGroup>
        ) }

        <SidebarGroup
          label="Booking Management"
          icon={<Folder size={20} />}
          open={openBooking}
          toggle={() => setOpenBooking(!openBooking)}
        >
          <SidebarSubItem href="/dashboard/booking/rooms" label="Rooms Booking" icon={<Calendar size={16} />} />
          <SidebarSubItem href="/dashboard/booking/apartments" label="Apartments Booking" icon={<Calendar size={16} />} />
          <SidebarSubItem href="/dashboard/booking/tickets" label="Bus Tickets Booking" icon={<Calendar size={16} />} />
          <SidebarSubItem href="/dashboard/booking/ticket" label="Events Booking" icon={<Calendar size={16} />} />
        </SidebarGroup>
         {userType === "admin" && (
        <SidebarGroup
          label="Payments Management"
          icon={<Folder size={20} />}
          open={openPayment}
          toggle={() => setOpenPayment(!openPayment)}
        >
          <SidebarSubItem href="/dashboard/payments" label="Payments" icon={<DollarSign size={16} />} />
        </SidebarGroup>
        )}
      </nav>
    </aside>
  );
}

function SidebarItem({ href, icon, label }: { href: string; icon: JSX.Element; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded transition">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SidebarGroup({
  label,
  icon,
  open,
  toggle,
  children
}: {
  label: string;
  icon: JSX.Element;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={toggle}
        className="flex items-start text-left justify-between w-full p-2 hover:bg-gray-700 rounded"
      >
        <span className="flex items-start gap-3">{icon}{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="pl-6 mt-2 space-y-1">{children}</div>}
    </div>
  );
}

function SidebarSubItem({
  href,
  label,
  icon
}: {
  href: string;
  label: string;
  icon?: JSX.Element;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
