'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface Vendor {
  _id: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  status: string;
  rating?: number;
  reviewCount?: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await apiService.getVendors();
      const vendorsData = Array.isArray(response)
        ? response
        : response?.vendors ?? response?.data?.vendors ?? [];
      setVendors(vendorsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

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
        <Button onClick={fetchVendors}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <Link href="/vendors/register">
          <Button>Become a Vendor</Button>
        </Link>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No vendors found.</p>
          <Link href="/vendors/register">
            <Button>Register as a Vendor</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{vendor.businessName}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {vendor.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {vendor.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {vendor.contactEmail}
                  </p>
                  {vendor.contactPhone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {vendor.contactPhone}
                    </p>
                  )}
                  {vendor.rating && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Rating:</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/vendors/${vendor._id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/vendors/${vendor._id}/services`}>
                    <Button size="sm" className="flex-1">
                      View Services
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