"use client";

import Link from "next/link";
import { ArrowRight, Play, Users, Mic2 } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {/* Fallback gradient while video loads */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video element - uses a placeholder video, replace with actual video URL */}
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
          {/* Add video sources when available */}
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated gradient orbs (subtle) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-soft animation-delay-1000" />

      <div className="relative z-10 container-default py-32 text-center">
        {/* Main Tagline */}
        <div className="mb-6 animate-fade-in-down">
          <span className="text-primary-400 text-lg md:text-xl font-semibold tracking-widest uppercase">
            The Jewish Culture Club
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
          Bringing Israeli Artists
          <span className="block mt-2 text-gradient">to Your Community</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
          The premier platform connecting Jewish communities worldwide with talented
          Israeli artists. Share tours, save costs, and create unforgettable cultural experiences.
        </p>

        {/* CTA buttons - Two paths */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <Link
            href="/register/community"
            className="group flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-200 shadow-soft-lg hover:shadow-glow min-w-[220px] justify-center"
          >
            <Users size={20} />
            Community Sign Up
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/register/artist"
            className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200 min-w-[220px] justify-center"
          >
            <Mic2 size={20} />
            Artist Sign Up
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100"
            />
          </Link>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 max-w-3xl mx-auto animate-fade-in-up animation-delay-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">30%</div>
              <div className="text-sm text-slate-400">Average savings on shared tours</div>
            </div>
            <div className="text-center p-4 md:border-x md:border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-sm text-slate-400">Verified Israeli artists</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-slate-400">Communities worldwide</div>
            </div>
          </div>
        </div>

        {/* Browse Artists Link */}
        <div className="mt-12 animate-fade-in-up animation-delay-700">
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Play size={16} className="fill-current" />
            <span>Browse our artists</span>
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
