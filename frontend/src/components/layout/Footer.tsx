"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-pink-100 to-pink-200 py-12">
      <div className="container mx-auto px-4">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8">
          <Link
            href="/register/community"
            className="text-slate-800 hover:text-slate-900 font-medium uppercase tracking-wide text-sm"
          >
            Sign Up
          </Link>
          <Link
            href="/about"
            className="text-slate-800 hover:text-slate-900 font-medium uppercase tracking-wide text-sm"
          >
            About Us
          </Link>
          <Link
            href="/terms"
            className="text-slate-800 hover:text-slate-900 font-medium uppercase tracking-wide text-sm"
          >
            Terms of Service
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          <a
            href="https://www.facebook.com/kolamba.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-800 hover:text-slate-900 transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={24} />
          </a>
          <a
            href="https://www.instagram.com/kolamba_org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-800 hover:text-slate-900 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
