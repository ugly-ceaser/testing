import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table } from '@/components/ui/table';

interface Package {
  _id: string;
  name: string;
}

interface ReportData {
  totalProfits: number;
  roiPayouts: number;
  activePackages: Package[];
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: '', amount: '', description: '', packageId: '', transactionHash: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reports');
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: form.userId, amount: form.amount, description: form.description }),
      });
      if (!res.ok) throw new Error('Failed to credit profit');
      setSuccess('Profit credited successfully');
      setForm({ ...form, amount: '', description: '' });
      await fetchReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: form.userId, amount: form.amount, packageId: form.packageId, transactionHash: form.transactionHash }),
      });
      if (!res.ok) throw new Error('Failed to deposit for investor');
      setSuccess('Deposit credited successfully');
      setForm({ ...form, amount: '', packageId: '', transactionHash: '' });
      await fetchReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: form.userId }),
      });
      if (!res.ok) throw new Error('Failed to delete investor');
      setSuccess('Investor and all transactions deleted');
      setForm({ userId: '', amount: '', description: '', packageId: '', transactionHash: '' });
      await fetchReport();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Reports & Actions</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-bold mb-2">Overview</h2>
        <div>Total Profits: <b>{report?.totalProfits ?? 0}</b></div>
        <div>ROI Payouts: <b>{report?.roiPayouts ?? 0}</b></div>
        <div>Active Packages:</div>
        <ul className="list-disc ml-6">
          {report?.activePackages.map(pkg => (
            <li key={pkg._id}>{pkg.name}</li>
          ))}
        </ul>
      </Card>
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-bold mb-2">Credit Profit to Investor</h2>
        <form onSubmit={handleProfit} className="space-y-4">
          <div>
            <Label htmlFor="userId">Investor User ID</Label>
            <Input name="userId" id="userId" value={form.userId} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input name="amount" id="amount" type="number" value={form.amount} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input name="description" id="description" value={form.description} onChange={handleChange} />
          </div>
          <Button type="submit" disabled={actionLoading}>Credit Profit</Button>
        </form>
      </Card>
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-bold mb-2">Deposit for Investor</h2>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <Label htmlFor="userId">Investor User ID</Label>
            <Input name="userId" id="userId" value={form.userId} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input name="amount" id="amount" type="number" value={form.amount} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="packageId">Package ID</Label>
            <Input name="packageId" id="packageId" value={form.packageId} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="transactionHash">Transaction Hash</Label>
            <Input name="transactionHash" id="transactionHash" value={form.transactionHash} onChange={handleChange} required />
          </div>
          <Button type="submit" disabled={actionLoading}>Deposit</Button>
        </form>
      </Card>
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-bold mb-2">Delete Investor & All Transactions</h2>
        <form onSubmit={handleDeleteInvestor} className="space-y-4">
          <div>
            <Label htmlFor="userId">Investor User ID</Label>
            <Input name="userId" id="userId" value={form.userId} onChange={handleChange} required />
          </div>
          <Button type="submit" variant="destructive" disabled={actionLoading}>Delete Investor</Button>
        </form>
      </Card>
    </div>
  );
}
