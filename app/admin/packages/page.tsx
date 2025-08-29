'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Package {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackageForm {
  name: string;
  minAmount: string;
  maxAmount: string;
  roiPercentage: string;
  durationDays: string;
  isActive: boolean;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageForm>({
    name: '',
    minAmount: '',
    maxAmount: '',
    roiPercentage: '',
    durationDays: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      minAmount: '',
      maxAmount: '',
      roiPercentage: '',
      durationDays: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      minAmount: pkg.minAmount.toString(),
      maxAmount: pkg.maxAmount.toString(),
      roiPercentage: pkg.roiPercentage.toString(),
      durationDays: pkg.durationDays.toString(),
      isActive: pkg.isActive,
    });
    setEditingId(pkg._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const packageData = {
        name: formData.name,
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        roiPercentage: parseFloat(formData.roiPercentage),
        durationDays: parseInt(formData.durationDays),
        isActive: formData.isActive,
      };

      const url = editingId ? `/api/admin/packages/${editingId}` : '/api/admin/packages';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'Package updated successfully!' : 'Package created successfully!');
        fetchPackages();
        resetForm();
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Package deleted successfully!');
        fetchPackages();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete package');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSuccess('Package status updated successfully!');
        fetchPackages();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update package status');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading packages...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Package Management</h1>
            <p className="text-gray-400">Create and manage investment packages</p>
          </div>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-md ${error ? 'bg-red-500/10 border border-red-500 text-red-500' : 'bg-green-500/10 border border-green-500 text-green-500'}`}>
            {error || success}
          </div>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Package' : 'Create New Package'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update package details' : 'Add a new investment package'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Starter, Professional"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roiPercentage">Daily ROI (%)</Label>
                    <Input
                      id="roiPercentage"
                      type="number"
                      step="0.01"
                      value={formData.roiPercentage}
                      onChange={(e) => setFormData({ ...formData, roiPercentage: e.target.value })}
                      placeholder="e.g., 12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount ($)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      placeholder="e.g., 999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationDays">Duration (Days)</Label>
                    <Input
                      id="durationDays"
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      placeholder="e.g., 30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Status</Label>
                    <select
                      id="isActive"
                      value={formData.isActive.toString()}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update Package' : 'Create Package'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your investment packages</CardDescription>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No packages found. Create your first package to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Amount Range</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg._id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.roiPercentage}% daily</TableCell>
                      <TableCell>
                        {formatCurrency(pkg.minAmount)} - {formatCurrency(pkg.maxAmount)}
                      </TableCell>
                      <TableCell>{pkg.durationDays} days</TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.isActive ? 'success' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(pkg._id, pkg.isActive)}
                        >
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(pkg._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}