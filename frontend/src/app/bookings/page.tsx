'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface Booking {
  _id: string;
  event?: {
    _id: string;
    title: string;
    date: string;
    location: string;
  };
  service?: {
    _id: string;
    title: string;
    vendor: {
      businessName: string;
    };
  };
  bookingDate: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setPaymentSuccess(true);
    } else if (canceled === 'true') {
      setPaymentCancelled(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getUserBookings();
      const bookingsData = Array.isArray(response) ? response : response?.bookings ?? [];
      setBookings(bookingsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to view your bookings.</p>
        <a href="/login">
          <Button>Login</Button>
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleReviewSubmit = async () => {
    if (!activeReviewBookingId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please choose a rating between 1 and 5.');
      return;
    }
    if (reviewComment.trim().length < 10) {
      setReviewError('Please write a review with at least 10 characters.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');
      await apiService.createReview({
        bookingId: activeReviewBookingId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess('Review submitted successfully!');
      setActiveReviewBookingId(null);
      setReviewRating(5);
      setReviewComment('');
      fetchBookings();
    } catch (err: any) {
      setReviewError(err.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCompletePayment = async (bookingId: string) => {
    try {
      const checkoutResponse = await apiService.createCheckoutSession({
        bookingId,
        successUrl: `${window.location.origin}/bookings?success=true`,
        cancelUrl: `${window.location.origin}/bookings?canceled=true`,
      });
      window.location.href = checkoutResponse.url;
    } catch (err: any) {
      setError(err.message || 'Unable to initiate payment.');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchBookings}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      </div>

      {paymentSuccess && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Payment successful! Your booking has been confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentCancelled && (
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Payment was cancelled. Your booking is saved but not confirmed. Complete payment to confirm your booking.
              </p>
            </div>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
          <div className="flex gap-4 justify-center">
            <a href="/events">
              <Button>Browse Events</Button>
            </a>
            <a href="/services">
              <Button variant="outline">Browse Services</Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {booking.event && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.event.title}</h3>
                      <p className="text-sm text-gray-600">
                        Event • {new Date(booking.event.date).toLocaleDateString()} • {booking.event.location}
                      </p>
                    </div>
                  )}
                  {booking.service && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.service.title}</h3>
                      <p className="text-sm text-gray-600">
                        Service by {booking.service.vendor.businessName}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${booking.totalAmount}</p>
                  <p className="text-sm text-gray-600">
                    Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : booking.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {booking.status === 'completed' && booking.event && (
                    <>
                      <Link href={`/bookings/${booking._id}/chat`}>
                        <Button variant="outline" size="sm">
                          Chat
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveReviewBookingId(booking._id)}
                      >
                        Leave Review
                      </Button>
                    </>
                  )}
                  {booking.paymentStatus === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompletePayment(booking._id)}
                    >
                      Complete Payment
                    </Button>
                  )}
                </div>
              </div>

              {activeReviewBookingId === booking._id && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Leave a review for this event</h4>
                  {reviewSuccess && (
                    <div className="mb-3 rounded-lg bg-green-100 px-4 py-3 text-green-800">
                      {reviewSuccess}
                    </div>
                  )}
                  {reviewError && (
                    <div className="mb-3 rounded-lg bg-red-100 px-4 py-3 text-red-800">
                      {reviewError}
                    </div>
                  )}
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} star{value > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Share your experience from this event."
                      />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        onClick={handleReviewSubmit}
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveReviewBookingId(null);
                          setReviewError('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}