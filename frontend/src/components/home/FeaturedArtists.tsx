"use client";

import { useRef } from "react";
import ArtistCard from "@/components/artists/ArtistCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Sample data matching Figma design
const sampleArtists = [
  {
    id: 1,
    name: "Tuna",
    category: "Music",
    description: "Itay Zvulun, known professionally by his stage name Tuna Is an Israeli rapper, singer, songwriter...",
    image: "/artists/tuna.jpg",
    rating: 4,
  },
  {
    id: 2,
    name: "Noga Erez",
    category: "Music",
    description: "Noga Erez is a visionary musician and producer with an innate talent for blending genres and pushing c...",
    image: "/artists/noga-erez.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "Jasmin Moallem",
    category: "Music",
    description: "Short description about the artist, recent work and notable awards. Up to 3 lines max",
    image: "/artists/jasmin-moallem.jpg",
    rating: 4,
  },
  {
    id: 4,
    name: "Rotem Bar",
    category: "Music",
    description: "Short description about the artist, recent work and notable awards. Up to 3 lines max",
    image: "/artists/rotem-bar.jpg",
    rating: 4.5,
  },
  {
    id: 5,
    name: "Eden Ben Zaken",
    category: "Music",
    description: "One of Israel's most beloved pop stars with numerous hit songs and sold-out performances worldwide.",
    image: "/artists/eden-ben-zaken.jpg",
    rating: 5,
  },
];

export default function FeaturedArtists() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title with decorative elements */}
        <div className="text-center mb-12 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-4 flex items-center gap-2 text-teal-400 opacity-60">
            <span className="text-2xl">~</span>
            <span className="text-lg">,</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            NEW ARTISTS
          </h2>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-2 flex items-center gap-2 text-pink-400 opacity-60">
            <span className="text-lg">~</span>
          </div>
        </div>

        {/* Artists Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronRight size={24} className="text-slate-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sampleArtists.map((artist) => (
              <div
                key={artist.id}
                className="flex-shrink-0 w-72 snap-start"
              >
                <ArtistCard {...artist} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
