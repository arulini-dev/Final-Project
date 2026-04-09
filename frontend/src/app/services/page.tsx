'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    address: string;
    coordinates: [number, number];
  };
  vendor: {
    _id: string;
    businessName: string;
  };
  images?: string[];
  availability: string;
  rating?: number;
  reviewCount?: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchServices();
  }, [searchQuery, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await apiService.getServices({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      });
      const servicesData = Array.isArray(response)
        ? response
        : response?.services ?? response?.data?.services ?? [];
      setServices(servicesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Catering',
    'Photography',
    'Music',
    'Decoration',
    'Transportation',
    'Entertainment',
    'Planning',
    'Other'
  ];

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
        <Button onClick={fetchServices}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No services found.</p>
          <Link href="/vendors/register">
            <Button>Become a Vendor</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {service.images && service.images.length > 0 && (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 text-sm">
                  by {service.vendor.businessName}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {service.location.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ${service.price}
                  </p>
                  {service.rating && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Rating:</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {service.rating.toFixed(1)} ({service.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/services/${service._id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/services/${service._id}/book`}>
                    <Button size="sm" className="flex-1">
                      Book Service
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}