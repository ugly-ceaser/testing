"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

interface Deposit {
  _id: string;
  amount: number;
  status: string;
  transactionHash: string;
  createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/deposits');
    const data = await res.json();
    setDeposits(data);
    setLoading(false);
  };

  const handleStatus = async (depositId: string, status: 'approved' | 'declined') => {
    setActionLoading(depositId);
    setError('');
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, status }),
      });
      if (!res.ok) throw new Error('Failed to update deposit');
      await fetchDeposits();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <DashboardLayout>
     <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Manage Deposits</h1>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading deposits...
        </div>
      ) : (
        <Card className="p-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2">User</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((dep) => (
                  <tr key={dep._id} className="border-b border-gray-800">
                    <td className="py-2">{dep.user?.name || "-"}</td>
                    <td>{dep.package?.name || "-"}</td>
                    <td>${dep.amount.toLocaleString()}</td>
                    <td className="truncate max-w-[150px]">
                      {dep.transactionHash}
                    </td>
                    <td>
                      <Badge
                        variant={
                          dep.status === "pending"
                            ? "secondary"
                            : dep.status === "declined"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {dep.status}
                      </Badge>
                    </td>
                    <td>{new Date(dep.createdAt).toLocaleString()}</td>
                    <td className="space-x-2">
                      {dep.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={actionLoading === dep._id}
                            onClick={() =>
                              handleStatus(dep._id, "approved")
                            }
                          >
                            {actionLoading === dep._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === dep._id}
                            onClick={() =>
                              handleStatus(dep._id, "declined")
                            }
                          >
                            {actionLoading === dep._id ? (
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
            {deposits.map((dep) => (
              <Card
                key={dep._id}
                className="p-4 flex flex-col space-y-2 border border-gray-800"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{dep.user?.name || "-"}</h2>
                  <Badge
                    variant={
                      dep.status === "pending"
                        ? "secondary"
                        : dep.status === "declined"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {dep.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{dep.user?.email}</p>
                <p className="text-xs text-gray-500">
                  Package: {dep.package?.name || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  Amount: ${dep.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Tx: {dep.transactionHash}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(dep.createdAt).toLocaleString()}
                </p>

                {dep.status === "pending" && (
                  <div className="flex flex-col space-y-2 mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={actionLoading === dep._id}
                      onClick={() => handleStatus(dep._id, "approved")}
                    >
                      {actionLoading === dep._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === dep._id}
                      onClick={() => handleStatus(dep._id, "declined")}
                    >
                      {actionLoading === dep._id ? (
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
