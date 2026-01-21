"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Search, ChevronDown } from "lucide-react";

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
          {/* Logo */}
          <Link href="/" className="flex items-center">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/artists"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Artists
            </Link>
            <Link
              href="/categories"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Categories
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search size={18} />
              Search
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isScrolled
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/register/community"
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isScrolled
                  ? "bg-primary-500 hover:bg-primary-600 text-white shadow-soft hover:shadow-soft-lg"
                  : "bg-white text-slate-900 hover:bg-white/90 shadow-soft"
              }`}
            >
              Get Started
            </Link>
          </div>

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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-soft-lg animate-fade-in-down">
            <nav className="container-default py-4 flex flex-col gap-1">
              <Link
                href="/artists"
                className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Artists
              </Link>
              <Link
                href="/categories"
                className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
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
                Log in
              </Link>
              <Link
                href="/register/community"
                className="mx-4 mt-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
