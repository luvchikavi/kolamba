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
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container-default">
        <div className="flex justify-between items-center h-20">
          {/* Left: Search */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search size={20} />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Image
              src="/kolamba_logo.png"
              alt="Kolamba"
              width={160}
              height={50}
              priority
              className={`h-10 w-auto transition-all duration-300 ${
                isScrolled ? "" : "brightness-0 invert"
              }`}
            />
          </Link>

          {/* Right: Sign In */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <User size={20} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>

            {/* Mobile menu button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-soft-lg animate-fade-in-down">
            <nav className="container-default py-4 flex flex-col gap-1">
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
              <div className="flex flex-col gap-2 mx-4 mt-2">
                <Link
                  href="/register/community"
                  className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-center transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community Sign Up
                </Link>
                <Link
                  href="/register/artist"
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-center transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Artist Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
