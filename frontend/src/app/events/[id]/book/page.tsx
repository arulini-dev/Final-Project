'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface EventDetails {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  basePrice: number;
  capacity: number;
  availableSpots: number;
  category: string;
  image?: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const response = await apiService.getEvent(eventId);
        setEvent(response);
      } catch (err: any) {
        setError(err.message || 'Unable to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!venue.trim() || !startTime || !endTime) {
      setError('Please provide a venue, start time, and end time.');
      return;
    }

    if (venue.trim().length < 2) {
      setError('Venue must be at least 2 characters long.');
      return;
    }

    if (venue.trim().length > 200) {
      setError('Venue cannot exceed 200 characters.');
      return;
    }

    if (new Date(startTime) <= new Date()) {
      setError('Start time must be in the future.');
      return;
    }

    if (specialRequests.trim().length > 500) {
      setError('Special requests cannot exceed 500 characters.');
      return;
    }

    setSubmitting(true);

    try {
      // First create the booking
      const bookingResponse = await apiService.createBooking({
        eventId,
        venue: venue.trim(),
        startTime,
        endTime,
        totalPrice: event!.basePrice,
        specialRequests: specialRequests.trim(),
      });

      // Then create Stripe checkout session
      const checkoutResponse = await apiService.createCheckoutSession({
        bookingId: bookingResponse._id || bookingResponse.id,
        successUrl: `${window.location.origin}/bookings?success=true`,
        cancelUrl: `${window.location.origin}/bookings?canceled=true`,
      });

      // Redirect to Stripe checkout
      window.location.href = checkoutResponse.url;
    } catch (err: any) {
      setError(err.message || 'Booking submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-600 mb-4">Event not found or could not be loaded.</p>
        <Link href="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  if (event.availableSpots <= 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Sold Out</h2>
          <p className="text-gray-600">This event is no longer available for booking.</p>
        </div>
        <Link href="/events">
          <Button>Browse Other Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-blue-600 font-semibold">Booking</p>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-sm text-gray-600">Location: {event.location}</p>
          <p className="text-sm text-gray-600">Price per ticket: ${event.basePrice}</p>
          <p className="text-sm text-gray-600">Available spots: {event.availableSpots}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Event Summary</h2>
            <p className="text-gray-600">{event.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{event.category}</p>
              </div>
              <div className="rounded-3xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-semibold text-gray-900">{event.capacity}</p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="grid gap-6">
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                  Venue
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Venue or room name"
                  className="mt-2 block w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Date & Time
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 block w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Date & Time
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 block w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  placeholder="Add any notes for the event organizer"
                  className="mt-2 block w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Processing payment...' : 'Proceed to Payment'}
              </Button>
              <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
                Back to events
              </Link>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Booking details</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Select the event start and end times, then enter your venue information. We'll create your booking and redirect you to secure payment processing.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Event</p>
              <p className="font-semibold text-gray-900">{event.title}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-gray-900">${event.basePrice}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Available Spots</p>
              <p className="font-semibold text-gray-900">{event.availableSpots}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
