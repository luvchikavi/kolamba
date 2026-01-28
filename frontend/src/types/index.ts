/**
 * TypeScript types for Kolamba
 */

export type UserRole = "artist" | "community" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Artist {
  id: number;
  userId: number;
  nameHe: string;
  nameEn?: string;
  bioHe?: string;
  bioEn?: string;
  profileImage?: string;
  priceSingle?: number;
  priceTour?: number;
  languages: string[];
  availability: Record<string, unknown>;
  city?: string;
  country: string;
  status: "pending" | "active" | "inactive";
  isFeatured: boolean;
  categories: Category[];
  createdAt: string;
}

export interface Community {
  id: number;
  userId: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  audienceSize?: string;
  language: string;
  status: string;
  createdAt: string;
}

export interface Category {
  id: number;
  nameHe: string;
  nameEn: string;
  slug: string;
  icon?: string;
  sortOrder: number;
}

export interface Booking {
  id: number;
  artistId: number;
  communityId: number;
  requestedDate?: string;
  location?: string;
  budget?: number;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  createdAt: string;
}

export interface TourSuggestion {
  communities: Community[];
  totalDistance: number;
  route: Array<{
    order: number;
    community: Community;
    distanceFromPrevious: number;
  }>;
}

export interface ArtistTourDate {
  id: number;
  artistId: number;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate?: string;
  description?: string;
  isBooked: boolean;
  createdAt: string;
}

export interface NearbyTouringArtist {
  artistId: number;
  artistName: string;
  profileImage?: string;
  tourDate: ArtistTourDate;
  distanceKm: number;
}
