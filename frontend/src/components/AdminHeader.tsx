'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AdminHeaderProps {
  className?: string;
}

export const AdminHeader = ({ className }: AdminHeaderProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Breadcrumb or page title could go here */}
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.name || 'Admin'}
          </h2>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Back to main site */}
          <Link href="/">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Site
            </Button>
          </Link>

          {/* Logout */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};