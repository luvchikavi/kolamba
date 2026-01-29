"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Users, Globe, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Community {
  id: number;
  name: string;
  location: string;
  community_type: string | null;
  member_count_min: number | null;
  member_count_max: number | null;
  language: string;
  event_types: string[] | null;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch(`${API_URL}/communities`);
        if (res.ok) {
          const data = await res.json();
          setCommunities(data);
        }
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter((community) => {
    return community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           community.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMemberCount = (min: number | null, max: number | null) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} members`;
    } else if (min) {
      return `${min.toLocaleString()}+ members`;
    } else if (max) {
      return `Up to ${max.toLocaleString()} members`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Communities</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Jewish Communities
              </h1>
              <p className="text-slate-600">
                Discover Jewish communities around the world
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-4 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="container-default py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              Found <span className="font-semibold text-slate-900">{filteredCommunities.length}</span> communities
            </p>

            {filteredCommunities.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No communities found</h3>
                <p className="text-slate-600">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.id}`}
                    className="group card card-hover overflow-hidden"
                  >
                    {/* Gradient Header */}
                    <div className="relative h-32 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                        {community.name.charAt(0)}
                      </span>
                      {community.community_type && (
                        <div className="absolute top-3 left-3">
                          <span className="badge-primary text-xs">{community.community_type}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
                        {community.name}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                        <MapPin size={14} />
                        <span>{community.location}</span>
                      </div>

                      {/* Member Count */}
                      {formatMemberCount(community.member_count_min, community.member_count_max) && (
                        <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                          <Users size={14} />
                          <span>{formatMemberCount(community.member_count_min, community.member_count_max)}</span>
                        </div>
                      )}

                      {/* Language */}
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Globe size={14} />
                        <span>{community.language}</span>
                      </div>

                      {/* Event Types */}
                      {community.event_types && community.event_types.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {community.event_types.slice(0, 2).map((eventType) => (
                            <span key={eventType} className="badge-secondary text-xs">
                              {eventType}
                            </span>
                          ))}
                          {community.event_types.length > 2 && (
                            <span className="badge-secondary text-xs">
                              +{community.event_types.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
