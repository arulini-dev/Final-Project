'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-yellow-100 p-3 mb-4">
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
      <p className="text-gray-600 mb-6">
        Your payment was cancelled. Your booking has been saved but not confirmed yet.
        You can complete the payment from your bookings page.
      </p>
      <div className="flex gap-4">
        <Link href="/bookings">
          <Button>Complete Payment</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline">Browse Events</Button>
        </Link>
      </div>
    </div>
  );
}