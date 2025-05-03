// components/DashboardSidebar.tsx
// components/DashboardSidebar.tsx
'use client';

import { JSX, useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardSidebar() {
    const [openManagement, setOpenManagement] = useState(false);
    const [openHotel, setOpenHotel] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    return (
        <aside className="w-64 bg-gray-900 text-white p-4 space-y-6">
            <div className="text-2xl font-bold mb-6">🌟 Dashboard</div>

            <nav className="space-y-3">
                <SidebarItem href="/dashboard" icon={<Home size={20} />} label="Home" />
                <SidebarItem href="/dashboard/analytics" icon={<BarChart2 size={20} />} label="Analytics" />

                {/* Management Group */}
                <SidebarGroup
                    label="Management"
                    icon={<Users size={20} />}
                    open={openManagement}
                    toggle={() => setOpenManagement(!openManagement)}
                >
                    <SidebarSubItem href="/dashboard/users" label="Users" icon={<UserPlus size={18} />} />
                    <SidebarSubItem href="/dashboard/roles" label="Roles" icon={<Shield size={18} />} />
                    <SidebarSubItem href="/dashboard/projects" label="Projects" icon={<Folder size={18} />} />
                </SidebarGroup>

                {/* Settings Group */}
                <SidebarGroup
                    label="Settings"
                    icon={<Settings size={20} />}
                    open={openSettings}
                    toggle={() => setOpenSettings(!openSettings)}
                >
                    <SidebarSubItem href="/dashboard/profile" label="Profile" />
                    <SidebarSubItem href="/dashboard/preferences" label="Preferences" />
                </SidebarGroup>
                {/* Hotel Room Management Group */}
                <SidebarGroup
                    label="Hotel Room Management"
                    icon={<Folder size={20} />}
                    open={openHotel}
                    toggle={() => setOpenHotel(!openHotel)}
                >
                    <SidebarSubItem
                        href="/dashboard/hotel/add-room"
                        label="Add New Room"
                        icon={<BedDouble size={16} />}
                    />
                    <SidebarSubItem
                        href="/dashboard/hotel/room-list"
                        label="Room List"
                        icon={<List size={16} />}
                    />
                    <SidebarSubItem
                        href="/dashboard/hotel/room-booking"
                        label="Room Booking"
                        icon={<CalendarCheck size={16} />}
                    />
                    <SidebarSubItem
                        href="/dashboard/hotel/payments"
                        label="View Payments"
                        icon={<CreditCard size={16} />}
                    />
                </SidebarGroup>
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
                <span className="flex items-start text-left gap-3">
                    {icon}
                    {label}
                </span>
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
