"use client";

import Link from "next/link";
import { Play } from "lucide-react";
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
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-8 tracking-tight">
          THE JEWISH CULTURE CLUB
        </h1>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
      </div>
    </section>
  );
}
