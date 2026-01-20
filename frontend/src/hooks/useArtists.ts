"use client";

import { useQuery } from "@tanstack/react-query";
import api, { type SearchParams } from "@/lib/api";

export function useArtists(params?: SearchParams) {
  return useQuery({
    queryKey: ["artists", params],
    queryFn: () => api.getArtists(params),
  });
}

export function useFeaturedArtists(limit = 4) {
  return useQuery({
    queryKey: ["artists", "featured", limit],
    queryFn: () => api.getFeaturedArtists(limit),
  });
}

export function useArtist(id: number) {
  return useQuery({
    queryKey: ["artist", id],
    queryFn: () => api.getArtist(id),
    enabled: !!id,
  });
}

export function useSearchArtists(params: SearchParams) {
  return useQuery({
    queryKey: ["search", "artists", params],
    queryFn: () => api.searchArtists(params),
  });
}
