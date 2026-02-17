"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Globe,
  Calendar,
  ArrowLeft,
  Loader2,
  Mail,
} from "lucide-react";
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
  contact_role: string | null;
  status: string;
  created_at: string;
}

export default function CommunityProfilePage() {
  const params = useParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch(`${API_URL}/hosts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCommunity(data);
        } else if (res.status === 404) {
          setError("Host not found");
        } else {
          setError("Failed to load host");
        }
      } catch (err) {
        console.error("Failed to fetch host:", err);
        setError("Failed to load host");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunity();
  }, [params.id]);

  const formatMemberCount = (min: number | null, max: number | null) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${max.toLocaleString()}`;
    }
    return "Not specified";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container-default py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {error || "Host not found"}
          </h1>
          <Link href="/hosts" className="btn-primary">
            Back to Hosts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100">
        <div className="container-default py-12">
          {/* Back Link */}
          <Link
            href="/hosts"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Hosts
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-5xl font-bold text-primary-500">
                {community.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {community.community_type && (
                  <span className="badge-primary">{community.community_type}</span>
                )}
                <span className="badge-secondary">{community.status}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {community.name}
              </h1>

              <div className="flex flex-wrap gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{community.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span>{community.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{formatMemberCount(community.member_count_min, community.member_count_max)} members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-default py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Types */}
            {community.event_types && community.event_types.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Events We Host
                </h2>
                <div className="flex flex-wrap gap-2">
                  {community.event_types.map((eventType) => (
                    <span
                      key={eventType}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {eventType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                About This Host
              </h2>
              <p className="text-slate-600">
                {community.name} is a {community.community_type || "Jewish community"} located in {community.location}.
                Our community primarily speaks {community.language} and has{" "}
                {formatMemberCount(community.member_count_min, community.member_count_max)} members.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Contact</h3>

              {community.contact_role && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500">Contact Role</p>
                  <p className="text-slate-900">{community.contact_role}</p>
                </div>
              )}

              <Link
                href={`/search`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Find Talents for Your Events
              </Link>
            </div>

            {/* Quick Facts */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Facts</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-500">Location</dt>
                  <dd className="text-slate-900">{community.location}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Language</dt>
                  <dd className="text-slate-900">{community.language}</dd>
                </div>
                {community.community_type && (
                  <div>
                    <dt className="text-sm text-slate-500">Host Type</dt>
                    <dd className="text-slate-900">{community.community_type}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-slate-500">Member Since</dt>
                  <dd className="text-slate-900">
                    {new Date(community.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
