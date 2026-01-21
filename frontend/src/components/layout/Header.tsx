"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Search, User } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      {/* Floating pill header */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg w-full max-w-none rounded-none -mt-4 pt-4"
            : "bg-white shadow-xl rounded-full max-w-xl"
        }`}
      >
        <div className={`flex justify-between items-center ${isScrolled ? "container-default h-16" : "h-14 px-6"}`}>
          {/* Left: Search */}
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            <Search size={18} />
            <span className="text-sm uppercase tracking-wide">Search</span>
          </Link>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/kolamba_logo.png"
              alt="Kolamba"
              width={120}
              height={40}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Right: Sign In */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            <User size={18} />
            <span className="text-sm uppercase tracking-wide hidden sm:inline">Sign In</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu button - shown when scrolled */}
      {isScrolled && (
        <button
          className="md:hidden fixed top-4 right-4 p-2 rounded-lg bg-white shadow-lg text-slate-600 hover:bg-slate-100 z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-xl animate-fade-in-down z-40">
          <nav className="p-4 flex flex-col gap-1">
            <Link
              href="/artists"
              className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Artists
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={18} />
              Search
            </Link>
            <hr className="my-2 border-slate-100" />
            <Link
              href="/login"
              className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/register/community"
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Community Sign Up
              </Link>
              <Link
                href="/register/artist"
                className="px-4 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-full font-medium text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Artist Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
