"use client";
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', walletAddress: '' });
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [edit, setEdit] = useState({ name: '', walletAddress: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setEdit({ name: data.name, walletAddress: data.walletAddress });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated successfully');
      setProfile({ ...profile, ...edit });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to change password');
      setSuccess('Password changed successfully');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-xl mx-auto">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Profile Details</h2>
          <div className="mb-2">Email: <span className="font-mono text-gray-400">{profile.email}</span></div>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={edit.name}
                onChange={e => setEdit({ ...edit, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                value={edit.walletAddress}
                onChange={e => setEdit({ ...edit, walletAddress: e.target.value })}
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{success}</div>}
            <Button type="submit" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwords.oldPassword}
                onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{success}</div>}
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
