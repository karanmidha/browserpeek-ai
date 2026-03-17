import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAuth } from '../../lib/admin/auth';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  MessageSquare,
  Mail,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and key metrics',
  },
  {
    name: 'Calendar',
    href: '/admin/calendar',
    icon: Calendar,
    description: 'Manage time slots and availability',
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: BookOpen,
    description: 'View and manage all bookings',
  },
  {
    name: 'Testimonials',
    href: '/admin/testimonials',
    icon: MessageSquare,
    description: 'Moderate customer testimonials',
  },
  {
    name: 'Inquiries',
    href: '/admin/inquiries',
    icon: Mail,
    description: 'Handle contact form submissions',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts',
  },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = adminAuth.getCurrentSession();

  const handleSignOut = async () => {
    await adminAuth.signOut();
    navigate('/admin/auth');
  };

  const formatSessionTime = (timestamp: number): string => {
    const remaining = Math.max(0, timestamp - Date.now());
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-forest-green rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-cream" />
              </div>
              <h1 className="text-lg font-bold text-forest-green">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          {session && (
            <div className="p-4 border-b border-gray-200 bg-forest-green/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center">
                  <span className="text-cream font-medium">
                    {session.user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-green truncate">
                    {session.user.user_metadata?.first_name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <Clock size={14} className="mr-1" />
                <span>Session expires in {formatSessionTime(session.expiresAt)}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-forest-green text-cream'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-forest-green'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`mr-3 ${
                      isActive ? 'text-cream' : 'text-gray-500 group-hover:text-forest-green'
                    }`}
                  />
                  <div>
                    <div>{item.name}</div>
                    <div
                      className={`text-xs ${
                        isActive ? 'text-cream/80' : 'text-gray-500'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 hover:text-red-900 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Admin Panel'}
              </h2>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {session?.user.user_metadata?.first_name || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};