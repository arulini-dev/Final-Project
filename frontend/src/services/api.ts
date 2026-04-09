import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || axiosError.message;
    return Promise.reject(new Error(message));
  }

  return Promise.reject(error);
};

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => handleError(error)
    );
  }

  private parseResponse<T>(response: AxiosResponse<T>) {
    const data = response.data as any;
    return data?.data ?? data;
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config).then(this.parseResponse);
  }

  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config).then(this.parseResponse);
  }

  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config).then(this.parseResponse);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config).then(this.parseResponse);
  }

  login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  register(userData: { name: string; email: string; password: string; role?: string }) {
    return this.post('/auth/register', userData);
  }

  getProfile() {
    return this.get('/auth/profile');
  }

  getEvents(params?: { page?: number; limit?: number; category?: string }) {
    return this.get('/events', { params });
  }

  getEvent(id: string) {
    return this.get(`/events/${id}`);
  }

  getBookingMessages(bookingId: string) {
    return this.get(`/chat/${bookingId}/messages`);
  }

  getEventReviews(eventId: string, params?: { page?: number; limit?: number; rating?: number; minRating?: number; maxRating?: number; sortBy?: string; sortOrder?: string }) {
    return this.get(`/reviews/event/${eventId}`, { params });
  }

  createReview(reviewData: { bookingId: string; rating: number; comment: string }) {
    return this.post('/reviews', reviewData);
  }

  createBooking(bookingData: {
    eventId: string;
    startTime: string;
    endTime: string;
    venue: string;
    totalPrice: number;
    specialRequests?: string;
  }) {
    return this.post('/bookings', bookingData);
  }

  getUserBookings() {
    return this.get('/bookings/my-bookings');
  }

  createCheckoutSession(paymentData: {
    bookingId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.post('/payments/create-checkout-session', paymentData);
  }

  getPaymentSessionStatus(sessionId: string) {
    return this.get('/payments/session-status', { params: { session_id: sessionId } });
  }

  getVendors(params?: { page?: number; limit?: number; category?: string }) {
    return this.get('/vendors/approved', { params });
  }

  getVendor(id: string) {
    return this.get(`/vendors/${id}`);
  }

  getServices(params?: { page?: number; limit?: number; category?: string; search?: string }) {
    return this.get('/services/search', { params });
  }

  getService(id: string) {
    return this.get(`/services/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;
