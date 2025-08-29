"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  totalUsers: number;
}


export default function AdminDashboardPage() {
  const [depositWallet, setDepositWallet] = useState<string>('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [packages, setPackages] = useState<{ _id: string; name: string; minAmount: number; maxAmount: number; roi: number }[]>([]);
  const [deposits, setDeposits] = useState<{ _id: string; userId: string; packageId: string; amount: number }[]>([]);
  const [selectedProfitUserId, setSelectedProfitUserId] = useState<string>('');
  const [selectedProfitPackageId, setSelectedProfitPackageId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch deposit wallet address uploaded by admin
    fetch('/api/admin/deposit-wallet')
      .then(res => res.json())
      .then(data => setDepositWallet(data.address || ''));
    // Fetch all deposits for dropdown
    fetch('/api/admin/deposits')
      .then(res => res.json())
      .then(data => setDeposits(data));
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // Fetch users for dropdowns
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
    // Fetch active packages for deposit dropdown
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Deposit Wallet Address Management */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">Deposit Wallet Address</h2>
          <div className="mb-2 text-gray-300">Current Address: <span className="font-mono text-yellow-400">{depositWallet || 'Not set'}</span></div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading('wallet');
              setActionSuccess(null);
              setActionError(null);
              const form = e.target as HTMLFormElement;
              const address = (form.elements.namedItem('walletAddress') as HTMLInputElement).value;
              try {
                const res = await fetch('/api/admin/deposit-wallet', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ address }),
                });
                if (!res.ok) throw new Error('Failed to update wallet address');
                setDepositWallet(address);
                form.reset();
                setActionSuccess('Wallet address updated!');
              } catch (err: any) {
                setActionError(err.message || 'Error occurred');
              } finally {
                setActionLoading(null);
              }
            }}
          >
            <input name="walletAddress" type="text" placeholder="Enter wallet address" className="w-full p-2 rounded bg-gray-900 text-white" required />
            <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded font-bold" disabled={actionLoading === 'wallet'}>
              {actionLoading === 'wallet' ? 'Saving...' : 'Update Address'}
            </button>
            {actionSuccess && <div className="text-green-500 text-sm mt-2">{actionSuccess}</div>}
            {actionError && <div className="text-red-500 text-sm mt-2">{actionError}</div>}
          </form>
        </Card>
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="text-gray-400 mb-2">Total Deposits</div>
              <Badge>{stats?.totalDeposits ?? 0}</Badge>
            </Card>
            <Card className="p-6">
              <div className="text-gray-400 mb-2">Total Withdrawals</div>
              <Badge>{stats?.totalWithdrawals ?? 0}</Badge>
            </Card>
            <Card className="p-6">
              <div className="text-gray-400 mb-2">Total Profits</div>
              <Badge>{stats?.totalProfits ?? 0}</Badge>
            </Card>
            <Card className="p-6">
              <div className="text-gray-400 mb-2">Total Users</div>
              <Badge>{stats?.totalUsers ?? 0}</Badge>
            </Card>
          </div>
        )}
        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Add Profit */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2">Add User Profit</h2>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading('profit');
                setActionSuccess(null);
                setActionError(null);
                const form = e.target as HTMLFormElement;
                const userId = (form.elements.namedItem('profitUserId') as HTMLSelectElement).value;
                const amount = (form.elements.namedItem('profitAmount') as HTMLInputElement).value;
                const packageId = (form.elements.namedItem('profitPackageId') as HTMLSelectElement).value;
                const depositId = (form.elements.namedItem('profitDepositId') as HTMLSelectElement).value;
                try {
                  const res = await fetch('/api/admin/profit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, amount, packageId, depositId }),
                  });
                  if (!res.ok) throw new Error('Failed to add profit');
                  form.reset();
                  setActionSuccess('Profit added!');
                } catch (err: any) {
                  setActionError(err.message || 'Error occurred');
                } finally {
                  setActionLoading(null);
                }
              }}
            >
              <select
                name="profitUserId"
                className="w-full p-2 rounded bg-gray-900 text-white"
                required
                value={selectedProfitUserId}
                onChange={e => setSelectedProfitUserId(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <input name="profitAmount" type="number" placeholder="Profit Amount" className="w-full p-2 rounded bg-gray-900 text-white" required />
              <select
                name="profitPackageId"
                className="w-full p-2 rounded bg-gray-900 text-white"
                required
                value={selectedProfitPackageId}
                onChange={e => setSelectedProfitPackageId(e.target.value)}
              >
                <option value="">Select Package</option>
                {packages.map(pkg => (
                  <option key={pkg._id} value={pkg._id}>{pkg.name} (₦{pkg.minAmount} - ₦{pkg.maxAmount}, ROI: {pkg.roi}%)</option>
                ))}
              </select>
              <select name="profitDepositId" className="w-full p-2 rounded bg-gray-900 text-white" required>
                <option value="">Select Deposit</option>
                {deposits
                  .filter(dep =>
                    (!selectedProfitUserId || dep.userId === selectedProfitUserId) &&
                    (!selectedProfitPackageId || dep.packageId === selectedProfitPackageId)
                  )
                  .map(dep => (
                    <option key={dep._id} value={dep._id}>
                      Deposit #{dep._id} - Amount: ₦{dep.amount}
                    </option>
                  ))}
              </select>
              <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded font-bold" disabled={actionLoading === 'profit'}>
                {actionLoading === 'profit' ? 'Processing...' : 'Add Profit'}
              </button>
              {actionSuccess && <div className="text-green-500 text-sm mt-2">{actionSuccess}</div>}
              {actionError && <div className="text-red-500 text-sm mt-2">{actionError}</div>}
            </form>
          </Card>

          {/* Deposit for User */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2">Deposit for User</h2>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading('deposit');
                setActionSuccess(null);
                setActionError(null);
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('depositEmail') as HTMLSelectElement).value;
                const amount = (form.elements.namedItem('depositAmount') as HTMLInputElement).value;
                const packageId = (form.elements.namedItem('depositPackage') as HTMLSelectElement).value;
                try {
                  const res = await fetch('/api/admin/deposit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, amount, packageId }),
                  });
                  if (!res.ok) throw new Error('Failed to add deposit');
                  form.reset();
                  setActionSuccess('Deposit added!');
                } catch (err: any) {
                  setActionError(err.message || 'Error occurred');
                } finally {
                  setActionLoading(null);
                }
              }}
            >
              <select name="depositEmail" className="w-full p-2 rounded bg-gray-900 text-white" required>
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </select>
              <input name="depositAmount" type="number" placeholder="Deposit Amount" className="w-full p-2 rounded bg-gray-900 text-white" required />
              <select name="depositPackage" className="w-full p-2 rounded bg-gray-900 text-white" required>
                <option value="">Select Package</option>
                {packages.map(pkg => (
                  <option key={pkg._id} value={pkg._id}>{pkg.name} (₦{pkg.minAmount} - ₦{pkg.maxAmount}, ROI: {pkg.roi}%)</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded font-bold" disabled={actionLoading === 'deposit'}>
                {actionLoading === 'deposit' ? 'Processing...' : 'Deposit'}
              </button>
              {actionSuccess && <div className="text-green-500 text-sm mt-2">{actionSuccess}</div>}
              {actionError && <div className="text-red-500 text-sm mt-2">{actionError}</div>}
            </form>
          </Card>

          {/* Send Mail to User */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-2">Send Mail to User</h2>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading('mail');
                setActionSuccess(null);
                setActionError(null);
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('mailEmail') as HTMLSelectElement).value;
                const subject = (form.elements.namedItem('mailSubject') as HTMLInputElement).value;
                const message = (form.elements.namedItem('mailMessage') as HTMLInputElement).value;
                try {
                  const res = await fetch('/api/admin/mail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, subject, message }),
                  });
                  if (!res.ok) throw new Error('Failed to send mail');
                  form.reset();
                  setActionSuccess('Mail sent!');
                } catch (err: any) {
                  setActionError(err.message || 'Error occurred');
                } finally {
                  setActionLoading(null);
                }
              }}
            >
              <select name="mailEmail" className="w-full p-2 rounded bg-gray-900 text-white" required>
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </select>
              <input name="mailSubject" type="text" placeholder="Subject" className="w-full p-2 rounded bg-gray-900 text-white" required />
              <textarea name="mailMessage" placeholder="Message" className="w-full p-2 rounded bg-gray-900 text-white" required />
              <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded font-bold" disabled={actionLoading === 'mail'}>
                {actionLoading === 'mail' ? 'Sending...' : 'Send Mail'}
              </button>
              {actionSuccess && <div className="text-green-500 text-sm mt-2">{actionSuccess}</div>}
              {actionError && <div className="text-red-500 text-sm mt-2">{actionError}</div>}
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
