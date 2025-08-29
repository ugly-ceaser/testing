"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Withdrawal {
  _id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "DECLINED";
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [balance, setBalance] = useState(5000);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(2);
  const [fee] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/withdrawals")
      .then((res) => res.json())
      .then((data) => setWithdrawals(data))
      .catch(() => setWithdrawals([]));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, destination, method: withdrawMethod }),
      });
      if (!res.ok) throw new Error("Failed to request withdrawal");
      const newWithdrawal = await res.json();
      setWithdrawals([newWithdrawal, ...withdrawals]);
      setAmount("");
      setDestination("");
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus = filterStatus ? w.status === filterStatus : true;
    const matchesSearch = search
      ? w.status.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
          <p className="text-gray-400 text-sm mt-1">
            Securely transfer money to your linked account.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-100/10 border-l-4 border-yellow-500 p-4 rounded">
          <h2 className="text-lg font-bold text-yellow-600 mb-2">
            How to Withdraw Funds
          </h2>
          <ol className="list-decimal ml-6 text-sm text-gray-300 space-y-1">
            <li>Choose your preferred withdrawal method.</li>
            <li>Enter the amount you wish to withdraw.</li>
            <li>Provide your destination account or wallet details.</li>
            <li>Review the transaction fee and final amount.</li>
            <li>Submit your request and confirm.</li>
            <li>Your request will be processed by the admin.</li>
            <li>Track your status in the history table.</li>
          </ol>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Withdrawal Form */}
          <div>
            {/* Balance Card */}
            <div className="bg-white/5 rounded-lg shadow p-6 mb-6">
              <div className="text-lg font-semibold text-gray-300">
                Available Balance
              </div>
              <div className="text-2xl font-bold text-green-500">
                ${balance.toLocaleString()}
              </div>
              {pendingWithdrawals > 0 && (
                <div className="text-xs text-yellow-400 mt-1">
                  Pending Withdrawals: {pendingWithdrawals}
                </div>
              )}
            </div>

            {/* Method Selection */}
            <div className="bg-white/5 rounded-lg shadow p-6 mb-6">
              <div className="text-lg font-semibold mb-4">
                Withdrawal Method
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {[
                  { label: "Bank Transfer", value: "bank", icon: "🏦" },
                  { label: "Mobile Money", value: "mobile", icon: "📱" },
                  { label: "PayPal", value: "paypal", icon: "💸" },
                  { label: "Crypto Wallet", value: "crypto", icon: "🪙" },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    className={`flex flex-col items-center px-4 py-2 rounded border-2 cursor-pointer transition-all ${
                      withdrawMethod === method.value
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-gray-700"
                    }`}
                    onClick={() => setWithdrawMethod(method.value)}
                  >
                    <span className="text-2xl mb-1">{method.icon}</span>
                    <span className="text-xs font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white/5 rounded-lg shadow p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowConfirm(true);
                }}
              >
                {/* Amount */}
                <div>
                  <Label htmlFor="withdrawAmount">Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-400">$</span>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="flex-1"
                    />
                    {/* Quick selects */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
                        onClick={() =>
                          setAmount((balance * 0.25).toFixed(2).toString())
                        }
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
                        onClick={() =>
                          setAmount((balance * 0.5).toFixed(2).toString())
                        }
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
                        onClick={() => setAmount(balance.toFixed(2))}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <Label htmlFor="destination">Destination Account/Wallet</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    placeholder="Enter or select your account/wallet"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Prefilled with saved details or add new.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note or reference"
                  />
                </div>

                {/* Fee Summary */}
                <div className="bg-gray-900 rounded p-3 mt-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Withdrawal Amount:</span>
                    <span className="font-bold">${amount || "0"}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Transaction Fee:</span>
                    <span className="font-bold text-red-400">${fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Amount You'll Receive:</span>
                    <span className="font-bold text-green-400">
                      ${amount ? (Number(amount) - fee).toFixed(2) : "0"}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-white py-2 font-bold text-lg mt-4"
                  disabled={!amount || !destination || loading}
                >
                  {loading ? "Submitting withdrawal request..." : "Proceed to Withdraw"}
                </Button>
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm mt-2">{error}</div>}
                {showSuccess && <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-md text-sm mt-2">Withdrawal request submitted! Estimated processing time: 24 hours.</div>}
              </form>
            </div>
          </div>

          {/* Right Column - Withdrawal History */}
          <div className="bg-white/5 rounded-lg shadow p-6">
            <div className="text-lg font-semibold mb-4">Withdrawal History</div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <Input
                type="text"
                placeholder="Search by Status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="border rounded px-2 py-1 bg-gray-900 text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-gray-400">
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-center text-gray-500"
                      >
                        No withdrawals yet.
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals
                      .slice((page - 1) * pageSize, page * pageSize)
                      .map((w) => (
                        <tr key={w._id} className="border-b border-gray-800">
                          <td className="p-3">${w.amount}</td>
                          <td className="p-3">
                            {w.status === "APPROVED" && (
                              <span className="bg-green-600 px-2 py-1 rounded text-white">
                                Approved ✅
                              </span>
                            )}
                            {w.status === "PENDING" && (
                              <span className="bg-yellow-600 px-2 py-1 rounded text-white">
                                Pending
                              </span>
                            )}
                            {w.status === "DECLINED" && (
                              <span className="bg-red-600 px-2 py-1 rounded text-white">
                                Declined ❌
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {new Date(w.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
              <span>
                Page {page} of{" "}
                {Math.ceil(filteredWithdrawals.length / pageSize) || 1}
              </span>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                <button
                  className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
                  disabled={
                    page === Math.ceil(filteredWithdrawals.length / pageSize)
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 text-right text-base text-gray-400">
              Total Approved:{" "}
              <span className="font-bold text-green-500">
                $
                {filteredWithdrawals
                  .filter((w) => w.status === "APPROVED")
                  .reduce((sum, w) => sum + w.amount, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <div className="text-xl font-bold mb-2">Confirm Withdrawal</div>
              <p className="mb-4 text-gray-700">
                Withdraw{" "}
                <span className="font-bold text-yellow-600">
                  ${Number(amount).toLocaleString()}
                </span>{" "}
                to{" "}
                <span className="font-bold text-blue-600">{destination}</span>?
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-yellow-500"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Confirm
                </Button>
                <Button
                  className="flex-1 bg-gray-300 text-gray-800"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <div className="text-5xl text-green-500 mb-2">✔️</div>
              <div className="text-xl font-bold mb-2">
                Withdrawal Request Submitted!
              </div>
              <p className="text-gray-700 mb-4">
                Estimated processing time: <b>24 hours</b>
              </p>
              <Button className="bg-yellow-500" onClick={() => setShowSuccess(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
