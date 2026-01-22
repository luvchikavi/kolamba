"use client";

import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <section className="relative h-screen flex items-end justify-center overflow-hidden">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        {/* Fallback gradient while video loads */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video element */}
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          poster="/hero-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Subtle dark overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Play button in center */}
      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors group">
        <Play size={32} className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
      </button>

      {/* Content at bottom */}
      <div className="relative z-10 w-full pb-16 px-4">
        {/* Main Title with decorative accents */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Left decorative squiggle */}
          <svg
            className="absolute left-4 sm:left-8 md:left-16 lg:left-24 xl:left-32 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-500"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M8 20C12 12 18 8 26 8M8 32C16 24 24 20 32 20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white text-center tracking-tight px-16 sm:px-20 md:px-24">
            THE JEWISH CULTURE CLUB
          </h1>

          {/* Right decorative squiggle */}
          <svg
            className="absolute right-4 sm:right-8 md:right-16 lg:right-24 xl:right-32 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-500"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M32 20C28 12 22 8 14 8M32 32C24 24 16 20 8 20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/register/community"
            className="px-8 py-3.5 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-all duration-200 min-w-[200px] text-center uppercase tracking-wide text-sm"
          >
            Community Sign Up
          </Link>
          <Link
            href="/register/artist"
            className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all duration-200 min-w-[200px] text-center uppercase tracking-wide text-sm"
          >
            Artist Sign Up
          </Link>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-4">
          <button className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-200">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-200">
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
