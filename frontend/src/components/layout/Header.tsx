"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Globe } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHebrew, setIsHebrew] = useState(true);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-brand-gradient tracking-wide">
              KOLAMBA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="flex items-center gap-1 text-neutral-700 hover:text-primary-500 transition-colors"
            >
              <Search size={18} />
              <span>{isHebrew ? "חיפוש" : "Search"}</span>
            </Link>
            <Link
              href="/categories"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              {isHebrew ? "קטגוריות" : "Categories"}
            </Link>
            <Link
              href="/artists"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              {isHebrew ? "אמנים" : "Artists"}
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsHebrew(!isHebrew)}
              className="flex items-center gap-1 text-neutral-600 hover:text-primary-500 transition-colors"
            >
              <Globe size={18} />
              <span className="text-sm">{isHebrew ? "EN" : "עב"}</span>
            </button>
            <Link
              href="/login"
              className="px-4 py-2 text-primary-500 hover:text-primary-600 transition-colors"
            >
              {isHebrew ? "התחבר" : "Login"}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded transition-colors"
            >
              {isHebrew ? "הרשמה" : "Sign Up"}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                href="/search"
                className="flex items-center gap-2 text-neutral-700 hover:text-primary-500"
              >
                <Search size={18} />
                {isHebrew ? "חיפוש" : "Search"}
              </Link>
              <Link
                href="/categories"
                className="text-neutral-700 hover:text-primary-500"
              >
                {isHebrew ? "קטגוריות" : "Categories"}
              </Link>
              <Link
                href="/artists"
                className="text-neutral-700 hover:text-primary-500"
              >
                {isHebrew ? "אמנים" : "Artists"}
              </Link>
              <hr className="my-2" />
              <Link
                href="/login"
                className="text-primary-500 hover:text-primary-600"
              >
                {isHebrew ? "התחבר" : "Login"}
              </Link>
              <Link
                href="/register"
                className="text-center px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded"
              >
                {isHebrew ? "הרשמה" : "Sign Up"}
              </Link>
              <button
                onClick={() => setIsHebrew(!isHebrew)}
                className="flex items-center gap-2 text-neutral-600"
              >
                <Globe size={18} />
                {isHebrew ? "English" : "עברית"}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
