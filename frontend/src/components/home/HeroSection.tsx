"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const heroSlides = [
  {
    id: 1,
    video: "/hero-video.mp4",
    poster: "/hero-poster.jpg",
  },
  {
    id: 2,
    video: "/hero-video-2.mp4",
    poster: "/hero-poster-2.jpg",
  },
  {
    id: 3,
    video: "/hero-video-3.mp4",
    poster: "/hero-poster-3.jpg",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setIsVideoLoaded(false);
    if (index < 0) {
      setCurrentSlide(heroSlides.length - 1);
    } else if (index >= heroSlides.length) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(index);
    }
  }, []);

  const goToPrevious = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [goToNext]);

  const currentSlideData = heroSlides[currentSlide];

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
          key={currentSlideData.id}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          poster={currentSlideData.poster}
        >
          <source src={currentSlideData.video} type="video/mp4" />
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
        {/* Main Logo - prominently displayed */}
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/kolamba_logo.png"
            alt="Kolamba - The Jewish Culture Club"
            width={756}
            height={376}
            priority
            className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl h-auto"
          />
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

        {/* Navigation Arrows and Dots */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goToPrevious}
            className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-200"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-200"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
