"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  MessageSquare,
  FileText,
  Calendar,
  Quote,
  Settings,
  Bell,
  ExternalLink,
} from "lucide-react";

// Mock community data (will be replaced with auth)
const mockUser = {
  id: 1,
  name: "Avital",
  communityName: "Beth Israel Synagogue",
  location: "New York, NY",
};

// Mock events in area
const mockEventsInArea = [
  {
    id: 1,
    artistName: "Noga Erez",
    artistImage: "/artists/noga-erez.jpg",
    eventName: "NY CONCERT",
    distance: "3,000 Miles from your location",
    date: "01/01/2026",
    bookedBy: "JCC Chicago",
  },
  {
    id: 2,
    artistName: "Idan Raichel",
    artistImage: "/artists/idan-raichel.jpg",
    eventName: "NY CONCERT",
    distance: "1,000 Miles from your location",
    date: "29/12/2025",
    bookedBy: "JCC Chicago",
  },
  {
    id: 3,
    artistName: "Tuna",
    artistImage: "/artists/tuna.jpg",
    eventName: "NY CONCERT",
    distance: "1,000 Miles from your location",
    date: "29/12/2025",
    bookedBy: "JCC Chicago",
  },
];

// Sidebar menu items
const menuItems = [
  { label: "Messages", icon: MessageSquare, count: 0, href: "/dashboard/community/messages" },
  { label: "Drafts", icon: FileText, count: 2, href: "/dashboard/community/drafts" },
  { label: "Events", icon: Calendar, href: "/dashboard/community/events" },
  { label: "Quotes", icon: Quote, href: "/dashboard/community/quotes" },
  { label: "Settings", icon: Settings, href: "/dashboard/community/settings" },
  { label: "Privacy & Notifications", icon: Bell, href: "/dashboard/community/privacy" },
];

function EventCard({ event }: { event: typeof mockEventsInArea[0] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
      {/* Artist Image */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <Image
          src={event.artistImage || "/placeholder-artist.jpg"}
          alt={event.artistName}
          fill
          className="object-cover"
        />
        {/* Date overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
          {event.date}
        </div>
        {/* Location overlay */}
        <div className="absolute bottom-10 left-3 text-white text-xs">
          <p>Location:</p>
          <p className="font-medium">USA, New York City</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{event.eventName}</h3>
          <p className="text-sm text-slate-500 mb-1">{event.distance}</p>
          <p className="text-sm text-slate-500 mb-1">
            <span className="font-medium">Date:</span> {event.date}
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-medium">Booked by:</span> {event.bookedBy}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Link
            href={`/artists/${event.id}`}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-900 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            VISIT PROFILE
            <ExternalLink size={14} />
          </Link>
          <button className="px-4 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors">
            MAKE IT A TOUR
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-full px-8 py-4 shadow-lg flex items-center gap-12">
              <Link
                href="/search"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <Search size={18} />
                <span className="uppercase tracking-wide text-sm">Search</span>
              </Link>

              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-wider text-slate-900">
                  KOLAMBA
                </span>
              </Link>

              <Link
                href="/dashboard/community"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <User size={18} />
                <span className="uppercase tracking-wide text-sm">{mockUser.name}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Greeting */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-6 mb-12">
              <div className="w-16 h-16 rounded-full border-2 border-pink-300 flex items-center justify-center">
                <User size={28} className="text-pink-400" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-2">
                  HEY {mockUser.name.toUpperCase()}
                </h1>
                <p className="text-xl text-slate-600">
                  IT&apos;S GOOD TO SEE YOU AGAIN MEYDELE!
                </p>
              </div>
            </div>

            {/* Events in Your Area */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-8">
                EVENTS IN YOUR AREA
              </h2>

              <div className="space-y-6">
                {mockEventsInArea.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Menu */}
          <div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-4 text-slate-800 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <span className="text-lg font-medium">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
