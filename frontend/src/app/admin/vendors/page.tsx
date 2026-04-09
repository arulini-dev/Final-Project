'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface Vendor {
  _id: string;
  businessName: string;
  approved: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  categories: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
}

const categoryLabels: { [key: string]: string } = {
  catering: 'Catering',
  decoration: 'Decoration',
  entertainment: 'Entertainment',
  photography: 'Photography',
  venue: 'Venue',
  transportation: 'Transportation',
  other: 'Other'
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showServicesModal, setShowServicesModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/vendors');
      setVendors(response.data.vendors);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (vendorId: string, isApproved: boolean) => {
    try {
      setUpdatingVendor(vendorId);
      await apiService.put(`/admin/vendors/${vendorId}/status`, { isApproved });

      // Update the local state
      setVendors(vendors.map(vendor =>
        vendor._id === vendorId
          ? { ...vendor, approved: isApproved }
          : vendor
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update vendor status');
    } finally {
      setUpdatingVendor(null);
    }
  };

  const handleViewServices = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowServicesModal(true);
    // Note: In a real implementation, you'd fetch services here
    // For now, we'll just show the modal with vendor info
  };

  const getStatusBadge = (approved: boolean) => {
    if (approved) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (approved: boolean) => {
    return approved ? 'Approved' : 'Pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <div className="text-sm text-gray-600">
          Total: {vendors.length} vendors
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          {vendors.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {vendor.businessName[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vendor.user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vendor.approved)}`}>
                        {getStatusText(vendor.approved)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {categoryLabels[category] || category}
                          </span>
                        ))}
                        {vendor.categories.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            +{vendor.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        {vendor.rating.toFixed(1)} ({vendor.totalReviews})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {vendor.contactEmail && (
                          <div className="text-gray-900">{vendor.contactEmail}</div>
                        )}
                        {vendor.contactPhone && (
                          <div className="text-gray-500">{vendor.contactPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!vendor.approved ? (
                        <button
                          onClick={() => handleApproveReject(vendor._id, true)}
                          disabled={updatingVendor === vendor._id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingVendor === vendor._id ? 'Approving...' : 'Approve'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveReject(vendor._id, false)}
                          disabled={updatingVendor === vendor._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingVendor === vendor._id ? 'Rejecting...' : 'Reject'}
                        </button>
                      )}
                      <button
                        onClick={() => handleViewServices(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Services
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-sm text-gray-500">No vendors have registered yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && selectedVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Services by {selectedVendor.businessName}
                </h3>
                <button
                  onClick={() => setShowServicesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Vendor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Business Name:</span> {selectedVendor.businessName}
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span> {selectedVendor.user.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedVendor.contactEmail || selectedVendor.user.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedVendor.contactPhone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedVendor.approved)}`}>
                        {getStatusText(selectedVendor.approved)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span> ⭐ {selectedVendor.rating.toFixed(1)} ({selectedVendor.totalReviews} reviews)
                    </div>
                  </div>
                  {selectedVendor.description && (
                    <div className="mt-3">
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-gray-600">{selectedVendor.description}</p>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="font-medium">Categories:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedVendor.categories.map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {categoryLabels[category] || category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Placeholder for services - in a real implementation, you'd fetch and display actual services */}
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Services Coming Soon</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Service details will be displayed here once the vendor adds their services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}