/**
 * API client for Kolamba backend
 */

// Normalize API URL - ensure it ends with /api
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

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
  price_tier?: string;
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
  bio_en?: string;
  profile_image?: string;
  price_single?: number;
  price_tier?: string;
  city?: string;
  country: string;
  is_featured: boolean;
  categories: Category[];
  subcategories: string[];
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

export interface AdminStats {
  total_users: number;
  total_artists: number;
  total_communities: number;
  pending_artists: number;
  active_artists: number;
  active_communities: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface AdminArtist {
  id: number;
  user_id: number;
  name_en: string | null;
  name_he: string | null;
  email: string;
  status: string;
  city: string | null;
  is_featured: boolean;
  created_at: string;
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
  getCommunities: () => api.get<Community[]>("/communities"),
  getCommunity: (id: number) => api.get<Community>(`/communities/${id}`),
  registerCommunity: (data: CommunityRegisterRequest) =>
    api.post<Community>("/communities", data),

  // Bookings
  createBooking: (data: BookingCreateRequest) =>
    api.post<Booking>("/bookings", data),
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
    return api.get<Booking[]>(`/bookings${query ? `?${query}` : ""}`);
  },
  getBooking: (id: number) => api.get<Booking>(`/bookings/${id}`),
  updateBooking: (id: number, data: Partial<Booking>) =>
    api.put<Booking>(`/bookings/${id}`, data),
  cancelBooking: (id: number) => api.delete<{ message: string }>(`/bookings/${id}`),

  // Tours
  getTourSuggestions: (artistId: number, maxDistanceKm = 500, minBookings = 2) =>
    api.get<TourSuggestion[]>(
      `/tours/suggestions?artist_id=${artistId}&max_distance_km=${maxDistanceKm}&min_bookings=${minBookings}`
    ),
  createTour: (data: TourCreateRequest) =>
    api.post<Tour>("/tours", data),
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
    return api.get<Tour[]>(`/tours${query ? `?${query}` : ""}`);
  },
  getTour: (id: number) => api.get<Tour>(`/tours/${id}`),
  updateTour: (id: number, data: Partial<Tour>) =>
    api.put<Tour>(`/tours/${id}`, data),
  deleteTour: (id: number) => api.delete<{ message: string }>(`/tours/${id}`),
  addBookingToTour: (tourId: number, bookingId: number) =>
    api.post<{ message: string }>(`/tours/${tourId}/bookings/${bookingId}`),
  removeBookingFromTour: (tourId: number, bookingId: number) =>
    api.delete<{ message: string }>(`/tours/${tourId}/bookings/${bookingId}`),

  // Admin endpoints
  admin: {
    getStats: (token: string) =>
      api.get<AdminStats>("/admin/stats", { token }),
    getUsers: (token: string, params?: { search?: string; role?: string; status?: string; limit?: number; offset?: number }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return api.get<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`, { token });
    },
    getUser: (token: string, userId: number) =>
      api.get<AdminUser>(`/admin/users/${userId}`, { token }),
    updateUser: (token: string, userId: number, data: Partial<AdminUser>) =>
      api.put<AdminUser>(`/admin/users/${userId}`, data, { token }),
    deleteUser: (token: string, userId: number) =>
      api.delete<{ message: string }>(`/admin/users/${userId}`, { token }),
    getArtists: (token: string, params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return api.get<AdminArtist[]>(`/admin/artists${query ? `?${query}` : ""}`, { token });
    },
    updateArtistStatus: (token: string, artistId: number, status: string) =>
      api.put<{ id: number; name_en: string; status: string; message: string }>(
        `/admin/artists/${artistId}/status?status=${status}`,
        undefined,
        { token }
      ),
    toggleArtistFeatured: (token: string, artistId: number, isFeatured: boolean) =>
      api.put<{ id: number; name_en: string; is_featured: boolean }>(
        `/admin/artists/${artistId}/featured?is_featured=${isFeatured}`,
        undefined,
        { token }
      ),
  },
};

export default api;
