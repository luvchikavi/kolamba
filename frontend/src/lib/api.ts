/**
 * API client for Kolamba backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new ApiError(error.detail || error.message || "Request failed", response.status);
  }

  return response.json();
}

// Types
export interface Category {
  id: number;
  name_he: string;
  name_en: string;
  slug: string;
  icon?: string;
  sort_order: number;
}

export interface Artist {
  id: number;
  user_id: number;
  name_he: string;
  name_en?: string;
  bio_he?: string;
  bio_en?: string;
  profile_image?: string;
  price_single?: number;
  price_tour?: number;
  languages: string[];
  availability: Record<string, boolean>;
  city?: string;
  country: string;
  status: string;
  is_featured: boolean;
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface ArtistListItem {
  id: number;
  name_he: string;
  name_en?: string;
  profile_image?: string;
  price_single?: number;
  city?: string;
  country: string;
  is_featured: boolean;
  categories: Category[];
}

export interface Community {
  id: number;
  user_id: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  audience_size?: string;
  language: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  language?: string;
  city?: string;
  is_featured?: boolean;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
}

export interface Booking {
  id: number;
  artist_id: number;
  community_id: number;
  requested_date?: string;
  location?: string;
  budget?: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreateRequest {
  artist_id: number;
  requested_date?: string;
  location?: string;
  budget?: number;
  notes?: string;
}

export interface CommunityRegisterRequest {
  email: string;
  name: string;
  community_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  audience_size?: string;
  language?: string;
}

export interface Tour {
  id: number;
  artist_id: number;
  name: string;
  region?: string;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  bookings: Booking[];
}

export interface TourSuggestion {
  region: string;
  booking_ids: number[];
  communities: Array<{
    id: number;
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
  }>;
  suggested_start?: string;
  suggested_end?: string;
  total_distance_km?: number;
  estimated_budget?: number;
}

export interface TourCreateRequest {
  artist_id: number;
  name: string;
  region?: string;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  description?: string;
  booking_ids?: number[];
}

// API Functions
export const api = {
  // Generic methods
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Categories
  getCategories: () => api.get<Category[]>("/categories"),

  // Artists
  getArtists: (params?: SearchParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<ArtistListItem[]>(`/artists${query ? `?${query}` : ""}`);
  },

  getFeaturedArtists: (limit = 4) =>
    api.get<ArtistListItem[]>(`/artists/featured?limit=${limit}`),

  getArtist: (id: number) => api.get<Artist>(`/artists/${id}`),

  // Search
  searchArtists: (params: SearchParams) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    return api.get<ArtistListItem[]>(`/search/artists?${searchParams.toString()}`);
  },

  // Communities
  getCommunities: () => api.get<Community[]>("/v1/communities"),
  getCommunity: (id: number) => api.get<Community>(`/v1/communities/${id}`),
  registerCommunity: (data: CommunityRegisterRequest) =>
    api.post<Community>("/v1/communities", data),

  // Bookings
  createBooking: (data: BookingCreateRequest) =>
    api.post<Booking>("/v1/bookings", data),
  getBookings: (params?: { status?: string; artist_id?: number; community_id?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<Booking[]>(`/v1/bookings${query ? `?${query}` : ""}`);
  },
  getBooking: (id: number) => api.get<Booking>(`/v1/bookings/${id}`),
  updateBooking: (id: number, data: Partial<Booking>) =>
    api.put<Booking>(`/v1/bookings/${id}`, data),
  cancelBooking: (id: number) => api.delete<{ message: string }>(`/v1/bookings/${id}`),

  // Tours
  getTourSuggestions: (artistId: number, maxDistanceKm = 500, minBookings = 2) =>
    api.get<TourSuggestion[]>(
      `/v1/tours/suggestions?artist_id=${artistId}&max_distance_km=${maxDistanceKm}&min_bookings=${minBookings}`
    ),
  createTour: (data: TourCreateRequest) =>
    api.post<Tour>("/v1/tours", data),
  getTours: (params?: { artist_id?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<Tour[]>(`/v1/tours${query ? `?${query}` : ""}`);
  },
  getTour: (id: number) => api.get<Tour>(`/v1/tours/${id}`),
  updateTour: (id: number, data: Partial<Tour>) =>
    api.put<Tour>(`/v1/tours/${id}`, data),
  deleteTour: (id: number) => api.delete<{ message: string }>(`/v1/tours/${id}`),
  addBookingToTour: (tourId: number, bookingId: number) =>
    api.post<{ message: string }>(`/v1/tours/${tourId}/bookings/${bookingId}`),
  removeBookingFromTour: (tourId: number, bookingId: number) =>
    api.delete<{ message: string }>(`/v1/tours/${tourId}/bookings/${bookingId}`),
};

export default api;
