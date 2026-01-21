"use client";

import Link from "next/link";
import { Mic2, Building2, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section bg-white">
      <div className="container-default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Artists */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
                <Mic2 className="text-white" size={28} />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Are You an Artist?
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Join our platform and connect with Jewish communities worldwide.
                Showcase your talent, manage bookings, and grow your audience.
              </p>

              <Link
                href="/register/artist"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-200"
              >
                Join as Artist
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* For Communities */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Building2 className="text-white" size={28} />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Looking for Artists?
              </h3>
              <p className="text-primary-100 mb-8 leading-relaxed">
                Register your community and discover talented Israeli artists.
                Book performances, workshops, and lectures for your events.
              </p>

              <Link
                href="/register/community"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200"
              >
                Register Community
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
