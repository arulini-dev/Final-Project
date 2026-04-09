'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        className={`hidden md:flex ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        } transition-all duration-300`}
      />

      {/* Mobile sidebar overlay */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />

          {/* Sidebar */}
          <AdminSidebar className="relative flex w-full max-w-xs flex-1 flex-col bg-white" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}