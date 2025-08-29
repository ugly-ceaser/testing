'use client';

import { ReactNode, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  User,
  Users,
  Settings,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}


export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const investorNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/deposits', label: 'Deposits', icon: TrendingUp },
    { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: TrendingDown },
    { href: '/dashboard/packages', label: 'Packages', icon: Package },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/deposits', label: 'Deposits', icon: TrendingUp },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: TrendingDown },
    { href: '/admin/packages', label: 'Packages', icon: Package },
  ];

  const navItems = isAdmin ? adminNavItems : investorNavItems;

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile Hamburger */}
      <button
        className="md:hidden absolute top-4 right-4 z-20 p-2 rounded bg-gray-900 text-yellow-500 focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-yellow-500" />
            <span className="text-xl font-bold text-white">Automated AI trades</span>
          </Link>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-yellow-500 text-black border-r-2 border-yellow-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          {/* Logout Button */}
          <button
            className="flex items-center px-6 py-3 mt-6 w-full text-sm font-medium text-red-500 bg-gray-900 border-2 border-red-500 rounded transition-colors hover:bg-red-500 hover:text-white"
            onClick={() => signOut()}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
   
  );
}