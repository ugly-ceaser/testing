"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';

interface Profit {
  _id: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export default function ProfitsPage() {
  const [profits, setProfits] = useState<Profit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profits')
      .then(res => res.json())
      .then(data => {
        setProfits(data);
        setLoading(false);
      })
      .catch(() => setProfits([]));
  }, []);

  const totalProfits = profits.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Cumulative Profits</h2>
        <div className="mb-2">Total Profits: <Badge>{totalProfits}</Badge></div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : profits.length === 0 ? (
          <div className="text-gray-400">No profits credited yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {profits.map(p => (
                <tr key={p._id}>
                  <td>{p.amount}</td>
                  <td>{p.description || '-'}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
