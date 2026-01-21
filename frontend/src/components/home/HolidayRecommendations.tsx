"use client";

import { useState, useRef } from "react";
import ArtistCard from "@/components/artists/ArtistCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const holidays = [
  "Hanukkah",
  "Rosh Ha'Shanna",
  "Passover",
  "Yom Kippur",
  "Shavout",
  "Purim",
];

// Sample artists for holidays (from Figma)
const holidayArtists = [
  {
    id: 101,
    name: "Emily Damari",
    category: "Inspiration",
    description: "Emily Damari (Born 1997) Is A British-Israeli Former Hostage Held By Hamas For Over 15 Months Fol...",
    image: "/artists/emily-damari.jpg",
    rating: 5,
  },
  {
    id: 102,
    name: "Etgar Keret",
    category: "Literature",
    description: "An Israeli writer known for his short stories, graphic novels, and scriptwriting for film and televisio...",
    image: "/artists/etgar-keret.jpg",
    rating: 4,
  },
  {
    id: 103,
    name: "Yonit Levi",
    category: "Journalism",
    description: "Levi is the chief news anchor of the flagship bulletin on Keshet 12. After finishing her army service as forei...",
    image: "/artists/yonit-levi.jpg",
    rating: 5,
  },
  {
    id: 104,
    name: "Udi Kagan",
    category: "Comedy",
    description: "An Israeli stand-up comedian, screenwriter, and editor known for his sharp wit and cultural commentary.",
    image: "/artists/udi-kagan.jpg",
    rating: 4.5,
  },
];

export default function HolidayRecommendations() {
  const [activeHoliday, setActiveHoliday] = useState("Hanukkah");
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
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-10 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 text-teal-400 opacity-40 text-2xl hidden md:block">
            ~,
          </div>
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 text-pink-400 opacity-40 text-2xl hidden md:block">
            ,,
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            HOLIDAY RECOMMENDATIONS
          </h2>
        </div>

        {/* Holiday Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {holidays.map((holiday) => (
            <button
              key={holiday}
              onClick={() => setActiveHoliday(holiday)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeHoliday === holiday
                  ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {holiday}
            </button>
          ))}
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
            {holidayArtists.map((artist) => (
              <div key={artist.id} className="flex-shrink-0 w-72 snap-start">
                <ArtistCard {...artist} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
