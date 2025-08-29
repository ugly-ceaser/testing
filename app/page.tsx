'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Users,
  DollarSign,
  Star,
  CheckCircle,
} from 'lucide-react';

interface Package {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
}

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

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

  // Default features for packages
  const getPackageFeatures = (packageName: string) => {
    const baseFeatures = ['Daily ROI', 'Secure Platform', 'Mobile App'];
    
    switch (packageName.toLowerCase()) {
      case 'starter':
        return [...baseFeatures, 'Basic Support'];
      case 'professional':
        return [...baseFeatures, 'Priority Support', 'Advanced Analytics'];
      case 'premium':
        return [...baseFeatures, 'VIP Support', 'Custom Strategies'];
      case 'elite':
        return [...baseFeatures, '24/7 Support', 'Personal Manager'];
      default:
        return baseFeatures;
    }
  };

  // Determine if package is popular (second package or highest ROI)
  const isPopularPackage = (pkg: Package, index: number) => {
    if (packages.length <= 1) return false;
    return index === 1 || pkg.roiPercentage === Math.max(...packages.map(p => p.roiPercentage));
  };

  const features = [
    {
      icon: BarChart3,
      title: 'AI-Powered Trading',
      description: 'Advanced algorithms analyze market trends 24/7',
    },
    {
      icon: TrendingUp,
      title: 'Daily Payouts',
      description: 'Receive your profits automatically every day',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Bank-grade security protects your investments',
    },
    {
      icon: Clock,
      title: 'Real-time Monitoring',
      description: 'Track your investments and profits in real-time',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Investor',
      content: 'I\'ve been earning consistent profits for 6 months. The platform is reliable and user-friendly.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Day Trader',
      content: 'The AI trading system outperforms my manual trading. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emma Davis',
      role: 'Business Owner',
      content: 'Perfect passive income solution. I can focus on my business while earning daily.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI Auto-Trading Program
          </h1>
          <p className="text-xl md:text-2xl text-yellow-500 mb-4">
            Earn Passively While You Sleep!
          </p>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of investors earning daily profits with our advanced AI trading system.
            Start with as little as $100 and watch your portfolio grow automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <form
              onSubmit={e => {
                e.preventDefault();
                const btn = (e.target as HTMLFormElement).querySelector('button');
                if (btn) {
                  btn.disabled = true;
                  btn.innerText = 'Redirecting to Register...';
                }
                setTimeout(() => { window.location.href = '/auth/register'; }, 1200);
              }}
            >
              <Button size="lg" className="text-lg px-8 py-4" type="submit">
                Start Investing Now
              </Button>
            </form>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const btn = (e.target as HTMLFormElement).querySelector('button');
                if (btn) {
                  btn.disabled = true;
                  btn.innerText = 'Checking...';
                }
                // Check session
                const res = await fetch('/api/auth/session');
                const session = await res.json();
                if (session?.user?.role === 'admin') {
                  if (btn) {
                    btn.innerText = 'Redirecting to Admin Dashboard...';
                  }
                  setTimeout(() => { window.location.href = '/admin/dashboard'; }, 1200);
                } else if (session?.user) {
                  if (btn) {
                    btn.innerText = 'Redirecting to Dashboard...';
                  }
                  setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
                } else {
                  if (btn) {
                    btn.innerText = 'Redirecting to Login...';
                  }
                  setTimeout(() => { window.location.href = '/auth/login'; }, 1200);
                }
              }}
            >
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" type="submit">
                Login to Dashboard
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Investment Packages */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Investment Packages
            </h2>
            <p className="text-lg text-gray-300">
              Choose the package that fits your investment goals
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-lg">Loading packages...</div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No packages available at the moment.</div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${packages.length >= 3 ? 'lg:grid-cols-3' : ''} ${packages.length >= 4 ? 'xl:grid-cols-4' : ''} gap-8`}>
              {packages.map((pkg, index) => {
                const popular = isPopularPackage(pkg, index);
                const features = getPackageFeatures(pkg.name);
                
                return (
                  <Card key={pkg._id} className="relative">
                    {popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-500 text-black">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-center">{pkg.name}</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-yellow-500">{pkg.roiPercentage}%</span>
                        <span className="text-gray-400"> daily</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Investment Range</p>
                          <p className="font-semibold">${pkg.minAmount.toLocaleString()} - ${pkg.maxAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="font-semibold">{pkg.durationDays} days</p>
                        </div>
                        <ul className="space-y-2">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href="/auth/register" className="block">
                          <Button className="w-full">Choose Plan</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-300">
              Advanced technology meets proven investment strategies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Investors Say
            </h2>
            <p className="text-lg text-gray-300">
              Join thousands of satisfied investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join our platform today and start earning passive income with AI-powered trading
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-12 py-4">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="h-8 w-8 text-yellow-500" />
            <span className="text-xl font-bold text-white">Automated AI trades</span>
          </div>
          <p className="text-gray-400">
            © 2024 Automated AI trades. All rights reserved. Invest responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}