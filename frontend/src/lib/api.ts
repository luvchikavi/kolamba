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
};

export default api;
