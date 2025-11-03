"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { User } from "@/Types";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleBlockUser = async (userId: string) => {
    try {
      if (!confirm("Are you sure you want to block this user?")) return;
      const response = axios.put(`/api/user/block?id=${userId}`);
      toast.promise(response, {
        loading: "Blocking user...",
        success: "User blocked successfully",
        error: "Failed to block user",
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };
  if (loading) return <Loading />;
  return (
    <>
      <Title
        title="User Management"
        subtitle="Manage The users of your platform"
      />
      <input
        type="text"
        name="search"
        className="input w-full input-primary join-item"
        placeholder="Search users by name, email..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
      />
      <div className="overflow-x-auto mt-4 bg-base-300">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Vehicle Number</th>
              <th>Vehicle Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src={user.profileImage || "/avatar.png"}
                            alt={user.name}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.vehicle.number}</td>
                  <td>{user.vehicle.model}</td>
                  <td>
                    <button
                      className="btn btn-error btn-outline"
                      onClick={() => {
                        handleBlockUser(user._id!);
                      }}
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
