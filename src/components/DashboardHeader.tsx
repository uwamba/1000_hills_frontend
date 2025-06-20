"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUsername(parsedUser.name || parsedUser.username || "User");
    } else {
      router.push("/signin");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");

    router.push("/signin");
  };

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span>Welcome, {username}!</span>
        <button
          onClick={handleLogout}
          className="bg-black-500 px-3 py-1 rounded hover:bg-black-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
