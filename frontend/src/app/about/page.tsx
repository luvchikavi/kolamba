"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Users, Music, Heart, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container-default py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Kolamba</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            The Jewish Culture Club - Connecting Israeli artists with Jewish communities worldwide
          </p>
        </div>
      </div>

      <div className="container-default py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="card p-8 md:p-12 space-y-12">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <div className="divider-gradient mb-6" />
            <p className="text-slate-600 leading-relaxed text-lg">
              Kolamba is dedicated to bridging the gap between talented Israeli artists and Jewish
              communities around the world. We believe that cultural exchange strengthens community
              bonds and creates lasting memories through shared experiences of music, theater,
              lectures, and artistic performances.
            </p>
          </section>

          {/* Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Globe className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Global Reach</h3>
              <p className="text-sm text-slate-600">
                Connecting Jewish communities across North America, Europe, and beyond
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <Music className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Talented Artists</h3>
              <p className="text-sm text-slate-600">
                Curated selection of musicians, speakers, performers, and educators
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Heart className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Cultural Connection</h3>
              <p className="text-sm text-slate-600">
                Creating meaningful experiences that celebrate Jewish heritage
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <div className="divider-gradient mb-6" />
            <p className="text-slate-600 mb-4">
              Have questions? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:info@kolamba.org"
              className="btn-primary inline-flex"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
