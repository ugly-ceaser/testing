'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, TrendingUp } from 'lucide-react';

interface Package {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
}

export default function PackagesPage() {
  const { data: session } = useSession();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPackages();
    if (session?.user?.balance) {
      setUserBalance(session.user.balance);
    }
  }, [session]);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
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

  const handleSwitch = async (pkgId: string) => {
    setSwitchingId(pkgId);
    setError('');
    try {
      const res = await fetch('/api/packages/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to switch package');
      }
      // Optionally, refetch packages or user info here
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwitchingId(null);
    }
  };

  const getPackageFeatures = (packageName: string) => {
    const baseFeatures = ['Daily ROI Payments', 'Secure Investment', 'Real-time Tracking'];
    
    switch (packageName.toLowerCase()) {
      case 'starter':
        return [...baseFeatures, 'Basic Support', 'Mobile Access'];
      case 'professional':
        return [...baseFeatures, 'Priority Support', 'Advanced Analytics', 'Email Notifications'];
      case 'premium':
        return [...baseFeatures, 'VIP Support', 'Custom Strategies', 'Dedicated Account Manager'];
      case 'elite':
        return [...baseFeatures, '24/7 Support', 'Personal Manager', 'Exclusive Insights', 'Priority Withdrawals'];
      default:
        return baseFeatures;
    }
  };

  const canAffordPackage = (minAmount: number) => {
    return userBalance >= minAmount;
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
        <div>
          <h1 className="text-3xl font-bold text-white">Investment Packages</h1>
          <p className="text-gray-400">Choose the perfect package for your investment goals</p>
          <div className="mt-2">
            <span className="text-sm text-gray-400">Your Balance: </span>
            <span className="text-lg font-semibold text-yellow-500">{formatCurrency(userBalance)}</span>
          </div>
        </div>

        {packages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-lg">No packages available at the moment.</div>
              <p className="text-sm text-gray-500 mt-2">Please check back later or contact support.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => {
              const features = getPackageFeatures(pkg.name);
              const affordable = canAffordPackage(pkg.minAmount);
              const isPopular = index === 1 || pkg.roiPercentage === Math.max(...packages.map(p => p.roiPercentage));
              
              return (
                <Card key={pkg._id} className={`relative ${!affordable ? 'opacity-75' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-black">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-center text-yellow-500">{pkg.name}</CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-white">{pkg.roiPercentage}%</span>
                      <span className="text-gray-400 text-lg"> daily</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Investment Range</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(pkg.minAmount)} - {formatCurrency(pkg.maxAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Duration</p>
                        <p className="text-lg font-semibold text-white">{pkg.durationDays} days</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-white text-sm">Package Features:</h4>
                      <ul className="space-y-2">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      {affordable ? (
                        <Button
                          className="w-full"
                          size="lg"
                          disabled={switchingId === pkg._id}
                          onClick={() => handleSwitch(pkg._id)}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {switchingId === pkg._id ? 'Switching...' : 'Invest Now'}
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Button className="w-full" size="lg" disabled>
                            Insufficient Balance
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            Minimum required: {formatCurrency(pkg.minAmount)}
                          </p>
                        </div>
                      )}
                      {error && <div className="text-red-500 mt-2">{error}</div>}
                    </div>

                    <div className="text-center text-xs text-gray-500">
                      <p>* Returns are calculated daily</p>
                      <p>* Principal + profits available after {pkg.durationDays} days</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Simple steps to start earning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Choose Package</h3>
                <p className="text-sm text-gray-400">Select an investment package that fits your budget and goals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Make Deposit</h3>
                <p className="text-sm text-gray-400">Send your investment amount and provide transaction hash</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-black font-bold">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Earn Daily</h3>
                <p className="text-sm text-gray-400">Receive daily ROI payments automatically to your balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}