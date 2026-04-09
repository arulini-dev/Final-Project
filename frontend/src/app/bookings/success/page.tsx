'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (success === 'true' || sessionId) {
      setLoading(false);
    } else {
      setError('Payment session not found');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/bookings">
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-green-100 p-3 mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Your booking has been confirmed and payment processed successfully.
      </p>
      <div className="flex gap-4">
        <Link href="/bookings">
          <Button>View My Bookings</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline">Browse More Events</Button>
        </Link>
      </div>
    </div>
  );
}