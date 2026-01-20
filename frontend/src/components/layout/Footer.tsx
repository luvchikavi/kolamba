"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

function DrishtiLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="#6366f1" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="4" fill="#6366f1" />
    </svg>
  );
}

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-bold text-brand-gradient mb-2">
              {t.brand.name}
            </h3>
            <div className="h-0.5 w-24 bg-brand-gradient mb-4"></div>
            <p className="text-sm text-neutral-400 uppercase tracking-widest mb-4">
              {t.brand.subtitle}
            </p>
            <p className="text-neutral-400 text-sm max-w-xs">
              {t.brand.shortDescription}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.links}</h4>
            <nav className="flex flex-col gap-2 text-neutral-400 text-sm">
              <Link href="/about" className="hover:text-primary-400 transition-colors">
                {t.footer.about}
              </Link>
              <Link href="/artists" className="hover:text-primary-400 transition-colors">
                {t.artists.title}
              </Link>
              <Link href="/categories" className="hover:text-primary-400 transition-colors">
                {t.categories.title}
              </Link>
              <Link href="/faq" className="hover:text-primary-400 transition-colors">
                {t.footer.faq}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
            <nav className="flex flex-col gap-2 text-neutral-400 text-sm">
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                {t.footer.privacy}
              </Link>
              <Link href="/contact" className="hover:text-primary-400 transition-colors">
                {t.footer.contact}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            {t.footer.copyright}
          </p>
          <a
            href="https://drishticonsulting.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors font-[var(--font-open-sans)]"
          >
            <span className="text-sm">{t.footer.developedBy}</span>
            <DrishtiLogo />
            <span className="text-sm font-medium">Drishti</span>
            <span className="text-neutral-600">|</span>
            <span className="text-sm">2026</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
