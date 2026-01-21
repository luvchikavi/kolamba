"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main footer content */}
      <div className="container-default py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-white">Kolamba</h3>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              The Jewish Culture Club. Connecting Israeli artists with Jewish
              communities worldwide for unforgettable cultural experiences.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:info@kolamba.org"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Discover</h4>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/artists"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Browse Artists
              </Link>
              <Link
                href="/categories"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Categories
              </Link>
              <Link
                href="/search"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Search
              </Link>
              <Link
                href="/about"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* For communities */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Communities</h4>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/register/community"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Register Community
              </Link>
              <Link
                href="/faq"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* For artists */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Artists</h4>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/register/artist"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Join as Artist
              </Link>
              <Link
                href="/artist-resources"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Resources
              </Link>
              <Link
                href="/success-stories"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Success Stories
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container-default py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Kolamba. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy
            </Link>
            <a
              href="https://drishticonsulting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Built by Drishti
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
