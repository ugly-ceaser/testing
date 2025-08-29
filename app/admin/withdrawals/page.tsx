"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/withdrawals");
    const data = await res.json();
    setWithdrawals(data);
    setLoading(false);
  };

  const handleStatus = async (
    withdrawalId: string,
    status: "approved" | "declined"
  ) => {
    setActionLoading(withdrawalId);
    setError("");
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, status }),
      });
      if (!res.ok) throw new Error("Failed to update withdrawal");
      await fetchWithdrawals();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-4">Manage Withdrawals</h1>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading withdrawals...
          </div>
        ) : (
          <Card className="p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2">User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w._id} className="border-b border-gray-800">
                      <td className="py-2">{w.user?.name || "-"}</td>
                      <td>${w.amount.toLocaleString()}</td>
                      <td>
                        <Badge
                          variant={
                            w.status === "pending"
                              ? "secondary"
                              : w.status === "declined"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {w.status}
                        </Badge>
                      </td>
                      <td>{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="space-x-2">
                        {w.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={actionLoading === w._id}
                              onClick={() => handleStatus(w._id, "approved")}
                            >
                              {actionLoading === w._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionLoading === w._id}
                              onClick={() => handleStatus(w._id, "declined")}
                            >
                              {actionLoading === w._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Decline"
                              )}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {withdrawals.map((w) => (
                <Card
                  key={w._id}
                  className="p-4 flex flex-col space-y-2 border border-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{w.user?.name || "-"}</h2>
                    <Badge
                      variant={
                        w.status === "pending"
                          ? "secondary"
                          : w.status === "declined"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {w.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{w.user?.email}</p>
                  <p className="text-xs text-gray-500">
                    Amount: ${w.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(w.createdAt).toLocaleString()}
                  </p>

                  {w.status === "pending" && (
                    <div className="flex flex-col space-y-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={actionLoading === w._id}
                        onClick={() => handleStatus(w._id, "approved")}
                      >
                        {actionLoading === w._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Approve"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === w._id}
                        onClick={() => handleStatus(w._id, "declined")}
                      >
                        {actionLoading === w._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Decline"
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
