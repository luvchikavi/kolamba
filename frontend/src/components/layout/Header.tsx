"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - from kolamba.org */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt={t.brand.name}
              width={140}
              height={58}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/search"
              className="flex items-center gap-1 text-neutral-700 hover:text-primary-500 transition-colors"
            >
              <Search size={18} />
              <span>{t.nav.search}</span>
            </Link>
            <Link
              href="/categories"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              {t.nav.categories}
            </Link>
            <Link
              href="/artists"
              className="text-neutral-700 hover:text-primary-500 transition-colors"
            >
              {t.nav.artists}
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-neutral-600 hover:text-primary-500 transition-colors"
              aria-label={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
            >
              <Globe size={18} />
              <span className="text-sm">{language === 'he' ? 'EN' : 'עב'}</span>
            </button>
            <Link
              href="/login"
              className="px-4 py-2 text-primary-500 hover:text-primary-600 transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register/community"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded transition-colors"
            >
              {t.nav.register}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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
                onClick={() => setIsMenuOpen(false)}
              >
                <Search size={18} />
                {t.nav.search}
              </Link>
              <Link
                href="/categories"
                className="text-neutral-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.categories}
              </Link>
              <Link
                href="/artists"
                className="text-neutral-700 hover:text-primary-500"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.artists}
              </Link>
              <hr className="my-2" />
              <Link
                href="/login"
                className="text-primary-500 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register/community"
                className="text-center px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.register}
              </Link>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-neutral-600"
              >
                <Globe size={18} />
                {language === 'he' ? 'English' : 'עברית'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
