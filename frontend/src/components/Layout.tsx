'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Surprise Events
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-gray-900">
                Events
              </Link>
              <Link href="/vendors" className="text-gray-700 hover:text-gray-900">
                Vendors
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-gray-900">
                Services
              </Link>
              {isAuthenticated && (
                <Link href="/bookings" className="text-gray-700 hover:text-gray-900">
                  My Bookings
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.name}
                  </span>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2026 Surprise Events. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};