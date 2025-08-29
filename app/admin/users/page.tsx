"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  walletAddress?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const handleBlock = async (userId: string, block: boolean) => {
    setActionLoading(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, block }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading users...
          </div>
        ) : (
          <Card className="p-6">
            <div className="hidden md:block overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Wallet</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-800">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.walletAddress || "-"}</td>
                      <td>
                        <Badge
                          variant={user.isBlocked ? "destructive" : "default"}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="space-x-2">
                        <Button
                          size="sm"
                          variant={user.isBlocked ? "default" : "destructive"}
                          disabled={actionLoading === user._id}
                          onClick={() => handleBlock(user._id, !user.isBlocked)}
                        >
                          {actionLoading === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isBlocked ? (
                            "Unblock"
                          ) : (
                            "Block"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === user._id}
                          onClick={() => handleDelete(user._id)}
                        >
                          {actionLoading === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map((user) => (
                <Card
                  key={user._id}
                  className="p-4 flex flex-col space-y-2 border border-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{user.name}</h2>
                    <Badge
                      variant={user.isBlocked ? "destructive" : "default"}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Wallet: {user.walletAddress || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-col space-y-2 mt-3">
                    <Button
                      size="sm"
                      variant={user.isBlocked ? "default" : "destructive"}
                      disabled={actionLoading === user._id}
                      onClick={() => handleBlock(user._id, !user.isBlocked)}
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.isBlocked ? (
                        "Unblock"
                      ) : (
                        "Block"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === user._id}
                      onClick={() => handleDelete(user._id)}
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

