"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  names: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  object: string;
  object_id: string;
  is_active: boolean;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editUser, setEditUser] = useState<User | null>(null); // for modal
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch users");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.error("Unexpected response format:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        alert(`User ${isActive ? "deactivated" : "activated"} successfully!`);
        fetchUsers();
      } else {
        alert("Failed to toggle user status.");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleSetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${id}/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        alert("Password updated successfully!");
      } else {
        alert("Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editUser) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${editUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });

      if (res.ok) {
        alert("User updated successfully!");
        setShowModal(false);
        fetchUsers();
      } else {
        alert("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-black">User List</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-gray-800">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="p-2 border">Names</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Object</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`${user.is_active
                    ? "bg-white text-gray-800"
                    : "bg-red-100 text-gray-900 font-medium"
                  }`}
              >
                <td className="p-2 border">{user.names}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.role}</td>
                <td className="p-2 border">
                  {user.object} (ID: {user.object_id})
                </td>
                <td className="p-2 border">
                  {user.is_active ? "Active" : "Inactive"}
                </td>
                <td className="p-2 border space-x-1 flex flex-wrap">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                    className={`${user.is_active
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-green-500 hover:bg-green-600"
                      } text-white px-2 py-1 rounded`}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleSetPassword(user.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
                  >
                    Set Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {showModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-black">Edit User</h2>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded text-black"
                type="text"
                value={editUser.names}
                onChange={(e) =>
                  setEditUser({ ...editUser, names: e.target.value })
                }
                placeholder="Name"
              />
              <input
                className="w-full border p-2 rounded text-black"
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                placeholder="Email"
              />
              <input
                className="w-full border p-2 rounded text-black"
                type="text"
                value={editUser.phone}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
                placeholder="Phone"
              />
              <input
                className="w-full border p-2 rounded text-black"
                type="text"
                value={editUser.address}
                onChange={(e) =>
                  setEditUser({ ...editUser, address: e.target.value })
                }
                placeholder="Address"
              />
              <input
                className="w-full border p-2 rounded text-black"
                type="text"
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
                placeholder="Role"
              />
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
