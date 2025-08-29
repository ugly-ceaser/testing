'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface DashboardStats {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  activePackage: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfits: 0,
    activePackage: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Current Balance',
      value: stats.balance,
      icon: DollarSign,
      description: 'Available for withdrawal',
      color: 'text-green-500',
    },
    {
      title: 'Total Deposits',
      value: stats.totalDeposits,
      icon: TrendingUp,
      description: 'All time deposits',
      color: 'text-blue-500',
    },
    {
      title: 'Total Withdrawals',
      value: stats.totalWithdrawals,
      icon: TrendingDown,
      description: 'All time withdrawals',
      color: 'text-orange-500',
    },
    {
      title: 'Total Profits',
      value: stats.totalProfits,
      icon: BarChart3,
      description: 'ROI earned',
      color: 'text-yellow-500',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {session?.user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(card.value)}
                  </div>
                  <p className="text-xs text-gray-400">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {stats.activePackage && (
          <Card>
            <CardHeader>
              <CardTitle>Active Package</CardTitle>
              <CardDescription>Your current investment package</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-yellow-500">
                {stats.activePackage}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                No recent activity
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>Your portfolio overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Invested</span>
                  <span className="text-white">{formatCurrency(stats.totalDeposits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Earned</span>
                  <span className="text-green-500">{formatCurrency(stats.totalProfits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROI</span>
                  <span className="text-yellow-500">
                    {stats.totalDeposits > 0 
                      ? `${((stats.totalProfits / stats.totalDeposits) * 100).toFixed(2)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}