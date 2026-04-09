'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface Event {
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
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents();
      const eventsData = Array.isArray(response)
        ? response
        : response?.data?.events ?? response?.events ?? [];
      
      // Map backend data to frontend interface
      const mappedEvents = eventsData.map((event: any) => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        basePrice: event.basePrice,
        capacity: event.capacity,
        availableSpots: event.availableSpots,
        image: event.images?.[0], // Take first image
        category: event.category,
        status: event.status
      }));
      
      setEvents(mappedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(events.map(event => event.category || 'Uncategorized')));
    return ['All', ...uniqueCategories];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return events;
    return events.filter(event => event.category === selectedCategory);
  }, [events, selectedCategory]);

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
        <Button onClick={fetchEvents}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse upcoming surprise events and filter by category.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Link href="/events/create">
            <Button>Create Event</Button>
          </Link>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No events found for this category.</p>
          <Button onClick={() => setSelectedCategory('All')}>Show All Events</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {event.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ${event.basePrice}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Available:</span> {event.availableSpots} / {event.capacity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/events/${event._id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </Link>
                  {event.availableSpots > 0 && (
                    <Link href={`/events/${event._id}/book`}>
                      <Button size="sm" className="flex-1">
                        Book Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}