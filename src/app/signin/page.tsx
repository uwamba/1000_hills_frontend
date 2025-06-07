"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"admin" | "manager">("admin");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const loginEndpoint = userType === "admin" ? "/login" : "/admin/login";

    try {
      const response = await fetch(`${API_BASE_URL}${loginEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", userType);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="w-96 p-6 shadow-md rounded bg-white text-black">
        <h2 className="text-xl font-bold mb-4">Sign In</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* User type selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-black">Login as:</label>
          <select
            className="w-full p-2 border rounded text-black"
            value={userType}
            onChange={(e) => setUserType(e.target.value as "admin" | "manager")}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3 text-black placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3 text-black placeholder-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Login
        </button>

        <div className="mt-3 text-center">
          <Link href="/forgot-password" className="text-blue-500 hover:underline text-sm">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
