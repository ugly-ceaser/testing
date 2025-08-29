"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminMailPage() {
  const [userId, setUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setMessage('Email sent successfully!');
      setUserId('');
      setSubject('');
      setHtml('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Send Custom Email to User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="html">Message (HTML)</Label>
            <Input
              id="html"
              value={html}
              onChange={e => setHtml(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {message && <div className="text-green-500">{message}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
