'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  basePrice: number;
  capacity: number;
  availableSpots: number;
  image?: string;
  category: string;
  status: string;
  rating?: number;
  totalReviews?: number;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: {
    name: string;
  };
  bookingId?: {
    startTime: string;
    venue: string;
  };
}

interface RatingStat {
  _id: number;
  count: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [eventData, reviewData] = await Promise.all([
          apiService.getEvent(eventId),
          apiService.getEventReviews(eventId)
        ]);

        setEvent(eventData);
        setReviews(reviewData?.reviews ?? []);
        setRatingDistribution(reviewData?.ratingDistribution ?? []);
      } catch (err: any) {
        setError(err.message || 'Unable to load event details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  const averageRating = useMemo(() => {
    if (event?.rating) return event.rating;
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [event, reviews]);

  const reviewCount = event?.totalReviews ?? reviews.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/events">
          <Button>Back to events</Button>
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found.</p>
        <Link href="/events">
          <Button>Back to events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full rounded-3xl object-cover shadow-sm"
            />
          )}

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="mt-2 text-sm text-gray-500">{event.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900">${event.basePrice}</p>
                <p className="text-sm text-gray-500">{event.availableSpots} spots available</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Date</p>
                <p className="mt-2 font-semibold text-slate-900">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                <p className="mt-2 font-semibold text-slate-900">{event.location}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">
                  {averageRating.toFixed(1)} ★
                </div>
                <p className="text-sm text-gray-500">{reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/events/${event._id}/book`}>
                <Button disabled={event.availableSpots <= 0}>
                  {event.availableSpots <= 0 ? 'Sold Out' : 'Book this event'}
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline">My bookings</Button>
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Rating breakdown</h2>
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const stat = ratingDistribution.find((item) => item._id === star);
                return (
                  <div key={star} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600">{star} star</span>
                    <span className="text-sm font-semibold text-gray-900">{stat?.count ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Quick links</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/events">
                <Button variant="outline">Back to events</Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline">Leave a review</Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
            <p className="text-sm text-gray-500">Read what customers say about this event.</p>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            No reviews yet. Book this event and leave your review from your bookings page.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{review.userId?.name ?? 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
                    {review.rating} ★
                  </div>
                </div>
                <p className="mt-4 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
