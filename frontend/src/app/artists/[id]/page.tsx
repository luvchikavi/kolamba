"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  Calendar,
  MessageSquare,
  Users,
  CheckCircle,
  Loader2,
  DollarSign,
  Heart,
  Youtube,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { isInAnyList, toggleFavorite } from "@/lib/favorites";

interface Category {
  id: number;
  name_en: string;
  name_he: string;
  slug: string;
}

interface Artist {
  id: number;
  user_id: number;
  name_en: string;
  name_he: string;
  bio_en: string | null;
  bio_he: string | null;
  profile_image: string | null;
  price_single: number | null;
  price_tour: number | null;
  price_tier: string | null;
  languages: string[];
  city: string | null;
  country: string | null;
  is_featured: boolean;
  categories: Category[];
  subcategories: string[];
  performance_types: string[];
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  portfolio_images: string[];
  video_urls: string[];
  spotify_links: string[];
  media_links: string[];
}

interface UserInfo {
  id: number;
  role: string;
  is_superuser?: boolean;
}

function getSocialUrl(platform: string, value: string): string {
  // If value is already a full URL, use as-is
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  // Handle @-prefixed handles
  const handle = value.startsWith("@") ? value.slice(1) : value;
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "facebook":
      return `https://www.facebook.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "youtube":
      return `https://www.youtube.com/${handle}`;
    default:
      return value;
  }
}

export default function ArtistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`${API_URL}/artists/${params.id}`);
        if (!response.ok) {
          throw new Error("Artist not found");
        }
        const data = await response.json();
        setArtist(data);
        setIsFavorited(isInAnyList(data.id));
      } catch (err) {
        setError("Failed to load artist");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data);
          }
        } catch {
          // User not logged in or token invalid
        }
      }
    };

    fetchArtist();
    fetchCurrentUser();
  }, [params.id]);

  const handleFavoriteToggle = () => {
    if (!artist) return;
    const artistName = artist.name_en || artist.name_he;
    const nowFavorited = toggleFavorite(artist.id, artistName);
    setIsFavorited(nowFavorited);
  };

  // Check if current user can see exact prices (admin or artist owner)
  const canSeeExactPrice = currentUser && (
    currentUser.is_superuser ||
    (artist && currentUser.id === artist.user_id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Artist Not Found</h1>
          <p className="text-slate-600 mb-6">The artist you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/search" className="btn-primary">
            Browse Artists
          </Link>
        </div>
      </div>
    );
  }

  const artistName = artist.name_en || artist.name_he;
  const artistBio = artist.bio_en || artist.bio_he || "No bio available.";

  const socialLinks = [
    { platform: "website", value: artist.website, icon: Globe },
    { platform: "instagram", value: artist.instagram, icon: Instagram },
    { platform: "youtube", value: artist.youtube, icon: Youtube },
    { platform: "facebook", value: artist.facebook, icon: Facebook },
    { platform: "twitter", value: artist.twitter, icon: Twitter },
    { platform: "linkedin", value: artist.linkedin, icon: Linkedin },
  ].filter((s) => s.value);

  const hasSocialLinks = socialLinks.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/search"
              className="hover:text-primary-600 transition-colors"
            >
              Artists
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{artistName}</span>
          </nav>
        </div>
      </div>

      {/* Artist Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center shadow-soft-lg overflow-hidden relative">
                {artist.profile_image ? (
                  <img
                    src={artist.profile_image}
                    alt={artistName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl font-bold text-white/50">
                    {artistName.charAt(0)}
                  </span>
                )}
                {/* Favorite Button */}
                <button
                  onClick={handleFavoriteToggle}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    size={22}
                    className={isFavorited ? "text-pink-500 fill-pink-500" : "text-pink-400"}
                  />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {artist.is_featured && (
                  <span className="badge-accent">Featured Artist</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {artistName}
              </h1>

              {/* Categories */}
              {artist.categories && artist.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {artist.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/search?category=${cat.slug}`}
                      className="badge-primary hover:bg-primary-200 transition-colors"
                    >
                      {cat.name_en}
                    </Link>
                  ))}
                </div>
              )}

              {/* Subcategories */}
              {artist.subcategories && artist.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {artist.subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              {/* Location & Languages */}
              <div className="flex flex-wrap gap-6 text-slate-600 mb-6">
                {(artist.city || artist.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-slate-400" />
                    <span>
                      {[artist.city, artist.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {artist.languages && artist.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-slate-400" />
                    <span>{artist.languages.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* CTA (Desktop) */}
              <Link
                href={`/booking/${artist.id}`}
                className="hidden lg:inline-flex btn-primary gap-2"
              >
                <MessageSquare size={20} />
                Send Booking Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-default py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
              <div className="divider-gradient mb-6" />
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{artistBio}</p>
            </section>

            {/* Performance Types */}
            {artist.performance_types && artist.performance_types.length > 0 && (
              <section className="card p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Performance Types
                </h2>
                <div className="divider-gradient mb-6" />
                <ul className="space-y-3">
                  {artist.performance_types.map((type, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600">
                      <CheckCircle
                        size={20}
                        className="text-primary-500 flex-shrink-0 mt-0.5"
                      />
                      {type}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Portfolio Images */}
            {artist.portfolio_images && artist.portfolio_images.length > 0 && (
              <section className="card p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Portfolio
                </h2>
                <div className="divider-gradient mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {artist.portfolio_images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={img}
                        alt={`${artistName} portfolio ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Video URLs */}
            {artist.video_urls && artist.video_urls.length > 0 && (
              <section className="card p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Videos
                </h2>
                <div className="divider-gradient mb-6" />
                <div className="space-y-4">
                  {artist.video_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Youtube size={18} />
                      {url}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Spotify */}
            {artist.spotify_links && artist.spotify_links.length > 0 && (
              <section className="card p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Spotify
                </h2>
                <div className="divider-gradient mb-6" />
                <div className="space-y-4">
                  {artist.spotify_links.map((link, idx) => {
                    const embedUrl = link
                      .replace("open.spotify.com/", "open.spotify.com/embed/")
                      .split("?")[0];
                    const isArtistEmbed = link.includes("/artist/");
                    return (
                      <iframe
                        key={idx}
                        src={embedUrl}
                        width="100%"
                        height={isArtistEmbed ? 352 : 152}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            {(artist.price_single || artist.price_tour || artist.price_tier) && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4">Pricing</h3>
                <div className="space-y-4">
                  {canSeeExactPrice ? (
                    <>
                      {artist.price_single && (
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users size={18} className="text-slate-400" />
                            Single Performance
                          </div>
                          <span className="text-xl font-bold text-slate-900">
                            ${artist.price_single.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {artist.price_tour && (
                        <div className="flex justify-between items-center py-3">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={18} className="text-slate-400" />
                            Tour
                          </div>
                          <span className="text-xl font-bold text-slate-900">
                            ${artist.price_tour.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Show price tier for community managers and guests */
                    artist.price_tier && (
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign size={18} className="text-slate-400" />
                          Price Range
                        </div>
                        <span className="text-2xl font-bold text-primary-600">
                          {artist.price_tier}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  {canSeeExactPrice
                    ? "Prices are estimates and may vary based on event requirements."
                    : "$ = Budget  $$= Mid-range  $$$ = Premium"}
                </p>
              </div>
            )}

            {/* Social Links - Icon only */}
            {hasSocialLinks && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(({ platform, value, icon: Icon }) => (
                    <a
                      key={platform}
                      href={platform === "website" ? value! : getSocialUrl(platform, value!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Media Links */}
            {artist.media_links && artist.media_links.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4">Press & Media</h3>
                <div className="space-y-2">
                  {artist.media_links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors truncate"
                    >
                      <Globe size={14} className="flex-shrink-0" />
                      {link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/booking/${artist.id}`}
              className="btn-primary w-full justify-center gap-2 py-4"
            >
              <MessageSquare size={20} />
              Send Booking Request
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-soft-lg">
        <Link
          href={`/booking/${artist.id}`}
          className="btn-primary w-full justify-center gap-2 py-4"
        >
          <MessageSquare size={20} />
          Send Booking Request
        </Link>
      </div>
    </div>
  );
}
