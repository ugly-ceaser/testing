"use client";
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Types
interface Package {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number;
}

interface Deposit {
  _id: string;
  package: Package;
  amount: number;
  transactionHash: string;
  status: string;
  createdAt: string;
}

export default function DepositsPage() {
  // ...existing code...
  // Declare filteredDeposits just before return
  // ...existing code...
  // Place this immediately before return:
  // const filteredDeposits: Deposit[] = deposits.filter((dep: Deposit) => {
  //   const matchesStatus = filterStatus ? dep.status === filterStatus : true;
  //   const matchesSearch = search
  //     ? dep.transactionHash.toLowerCase().includes(search.toLowerCase()) ||
  //       dep.status.toLowerCase().includes(search.toLowerCase())
  //     : true;
  //   return matchesStatus && matchesSearch;
  // });

  // ...existing code...

  // ...existing code...
  // (Move filteredDeposits to just before return)

    // Wallet address fetched from admin
    const [walletAddress, setWalletAddress] = useState('');
    useEffect(() => {
      fetch('/api/admin/deposit-wallet')
        .then(res => res.json())
        .then(data => setWalletAddress(data.address || ''));
    }, []);

  // Place this immediately before return:
  // const filteredDeposits: Deposit[] = deposits.filter((dep: Deposit) => {
  //   const matchesStatus = filterStatus ? dep.status === filterStatus : true;
  //   const matchesSearch = search
  //     ? dep.transactionHash.toLowerCase().includes(search.toLowerCase()) ||
  //       dep.status.toLowerCase().includes(search.toLowerCase())
  //     : true;
  //   return matchesStatus && matchesSearch;
  // });

  // ...existing code...

  // Place filteredDeposits just before return
  // ...existing code...
  // filteredDeposits should be declared just before return
  // State for deposit history table
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ...existing code...
  // deposits state must be declared before filteredDeposits
  // ...existing code...
  // Move filteredDeposits to just before return

  // ...existing code...

  // Place this before return statement:
  // const filteredDeposits = deposits.filter(...)
  const [packages, setPackages] = useState<Package[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Example wallet address removed; using state variable from useState and useEffect above

  useEffect(() => {
    // Fetch packages
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(() => setPackages([]));
    // Fetch deposits
    fetch('/api/deposits')
      .then(res => res.json())
      .then(data => setDeposits(data))
      .catch(() => setDeposits([]));
  }, []);

  // ...existing code...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage,
          amount,
          transactionHash,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit deposit');
      const newDeposit = await res.json();
      setDeposits([newDeposit, ...deposits]);
      setSelectedPackage('');
      setAmount('');
      setTransactionHash('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

  // Helper for package details
  const packageDetails = {
    Starter: { min: 2000, max: 49999, roi: 12 },
    Gold: { min: 50000, max: 199999, roi: 15 }
  };

  // Find selected package details
  const selectedDetails = packages.find(pkg => pkg._id === selectedPackage);
  const minAmount = selectedDetails?.minAmount || 0;
  const maxAmount = selectedDetails?.maxAmount || 0;
  const roi = selectedDetails?.roi || 0;

  // Validation
  const isAmountValid = amount && Number(amount) >= minAmount && Number(amount) <= maxAmount;
  const isFormValid = selectedPackage && isAmountValid && transactionHash;

  // Filtered deposits (declare after deposits is assigned)
  const filteredDeposits: Deposit[] = deposits.filter((dep: Deposit) => {
    const matchesStatus = filterStatus ? dep.status === filterStatus : true;
    const matchesSearch = search
      ? dep.transactionHash.toLowerCase().includes(search.toLowerCase()) ||
        dep.status.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <a href="/dashboard" className="text-xs text-blue-600 hover:underline w-fit">← Back to Dashboard</a>

      {/* Deposit Instructions */}
      <div className="bg-yellow-100/10 border-l-4 border-yellow-500 p-4 mb-6 rounded">
        <h2 className="text-lg font-bold text-yellow-600 mb-2">How to Make a Deposit</h2>
        <ol className="list-decimal ml-6 text-sm text-gray-300 space-y-1">
          <li>Select your preferred investment package.</li>
          <li>Enter the amount you wish to deposit (must be within the package range).</li>
          <li>Send your deposit to the admin wallet address shown below.</li>
          <li>Copy your crypto transaction hash (TxID) after sending.</li>
          <li>Paste the transaction hash in the form and submit your deposit request.</li>
          <li>Your deposit will be reviewed and approved by the admin.</li>
          <li>Once approved, your investment will start earning daily ROI.</li>
        </ol>
        <div className="mt-2 text-xs text-gray-400">Need help? Contact support for assistance.</div>
      </div>

      {/* Responsive Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel: Deposit Form */}
        <div>
          <div className="bg-white/5 rounded-lg shadow p-6">
            <div className="text-lg font-semibold mb-4">Deposit Form</div>
              {/* Package Selector */}
              <div className="mb-4">
                <Label htmlFor="package">Select Package</Label>
                <div className="flex gap-4 mt-2">
                  {packages.map(pkg => (
                    <div
                      key={pkg._id}
                      className={`border rounded-lg p-3 cursor-pointer flex-1 ${selectedPackage === pkg._id ? 'border-yellow-500 shadow-lg' : 'border-gray-700'}`}
                      onClick={() => setSelectedPackage(pkg._id)}
                    >
                      <div className="font-bold text-lg">{pkg.name}</div>
                      <div className="text-xs text-gray-400">Min ${pkg.minAmount} – Max ${pkg.maxAmount}</div>
                      <div className="text-xs text-yellow-500">{pkg.roi}% Daily ROI</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit Amount */}
              <div className="mb-4">
                <Label htmlFor="amount">Deposit Amount (USD)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-400">$</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">Enter an amount within your selected package range.</div>
                {!isAmountValid && amount && (
                  <div className="text-xs text-red-500 mt-1">Amount must be between ${minAmount} and ${maxAmount}.</div>
                )}
              </div>

              {/* Transaction Hash */}
              <div className="mb-4">
                <Label htmlFor="txHash">Transaction Hash (TxID)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="txHash"
                    value={transactionHash}
                    onChange={e => setTransactionHash(e.target.value)}
                    required
                    className="flex-1"
                  />
                  {/* Copy-paste icon placeholder */}
                  <button type="button" className="p-2 text-gray-400 hover:text-yellow-500" onClick={() => navigator.clipboard.writeText(transactionHash)}>
                    <span role="img" aria-label="copy">📋</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Paste your crypto transaction hash for verification.</div>
              </div>

              {/* Wallet Info */}
              <div className="mb-4">
                <Label>Admin Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={walletAddress} readOnly className="flex-1 font-mono" />
                  <button type="button" className="p-2 text-gray-400 hover:text-yellow-500" onClick={() => navigator.clipboard.writeText(walletAddress)}>
                    <span role="img" aria-label="copy">📋</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Send your deposit to this address.</div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 rounded font-bold text-lg mt-4"
                disabled={!isFormValid || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Submitting...' : 'Submit Deposit Request'}
              </Button>
              {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm mt-2">{error}</div>}
              {/* If you want to show a success message, ensure showSuccess is defined in your state */}
              {/* {showSuccess && <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-md text-sm mt-2">Deposit successful! Your funds will be credited soon.</div>} */}
            <div className="bg-white/5 rounded-lg shadow p-6">
              <div className="text-lg font-semibold mb-4">Deposit History</div>
              {/* Search/filter bar */}
              <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search by Tx Hash or Status..."
                  className="border rounded px-2 py-1 w-full md:w-1/2"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="border rounded px-2 py-1"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
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
                      <th className="p-2">Package</th>
                      <th className="p-2">Amount ($)</th>
                      <th className="p-2">Tx Hash</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.slice((page-1)*pageSize, page*pageSize).map((dep: Deposit) => (
                      <tr key={dep._id} className="border-b border-gray-800">
                        <td className="p-2">{dep.package?.name || '-'}</td>
                        <td className="p-2">${dep.amount}</td>
                        <td className="p-2">
                          <a
                            href={`https://etherscan.io/tx/${dep.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {dep.transactionHash.slice(0, 10)}...{/* show short hash */}
                          </a>
                        </td>
                        <td className="p-2">
                          {dep.status === 'APPROVED' && <span className="bg-green-600 text-white px-2 py-1 rounded">Approved ✅</span>}
                          {dep.status === 'PENDING' && <span className="bg-yellow-600 text-white px-2 py-1 rounded">Pending</span>}
                          {dep.status === 'DECLINED' && <span className="bg-red-600 text-white px-2 py-1 rounded">Declined ❌</span>}
                        </td>
                        <td className="p-2">{new Date(dep.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400">
                  Page {page} of {Math.ceil(filteredDeposits.length / pageSize)}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                    disabled={page === 1}
                    onClick={() => setPage(page-1)}
                  >Prev</button>
                  <button
                    className="px-2 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
                    disabled={page === Math.ceil(filteredDeposits.length / pageSize)}
                    onClick={() => setPage(page+1)}
                  >Next</button>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 text-right text-sm text-gray-400">
                Total Deposits Approved: <span className="font-bold text-green-500">${filteredDeposits.filter((d: Deposit) => d.status === 'APPROVED').reduce((sum: number, d: Deposit) => sum + d.amount, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
