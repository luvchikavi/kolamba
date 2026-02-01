"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Sparkles, Users, Target, Lightbulb, MapPin, Star, CheckCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container-default py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">כל העולם במה | All The World&apos;s a Stage</h1>
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

        <div className="space-y-12">
          {/* Who We Are */}
          <section className="card p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Users className="text-white" size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Who We Are</h2>
            </div>
            <div className="divider-gradient mb-6" />
            <p className="text-slate-600 leading-relaxed text-lg">
              Kolamba is a digital platform that connects Israeli and Jewish creators, artists, and speakers
              with Jewish communities around the world. We bridge the gap between talented performers who lack
              the means to reach diaspora communities and Jewish groups worldwide who struggle to discover
              authentic Israeli and Jewish cultural offerings.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg mt-4">
              Today, only well-known, well-connected performers secure international bookings in established venues.
              Kolamba aims to change that through straightforward, effective matchmaking between creators and audiences.
            </p>
          </section>

          {/* The Platform */}
          <section className="card p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="text-white" size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">The Platform</h2>
            </div>
            <div className="divider-gradient mb-6" />
            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              Kolamba is a smart cultural matchmaking and booking platform designed to make discovering
              and booking Jewish talent simple and effective.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Target className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">AI-Powered Matching</h3>
                  <p className="text-sm text-slate-600">Smart algorithms to identify suitable creators and performances for your community</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Users className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Hundreds of Artists</h3>
                  <p className="text-sm text-slate-600">Access to Jewish artists spanning music, film, journalism, literature, and more</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">On the Map</h3>
                  <p className="text-sm text-slate-600">Geographic visibility for touring artists to connect with nearby communities</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Star className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Verified Reviews</h3>
                  <p className="text-sm text-slate-600">Honest ratings and reviews from communities who have booked performers</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Personalized Recommendations</h3>
                  <p className="text-sm text-slate-600">Suggestions based on your community&apos;s preferences and past bookings</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Collaborative Booking</h3>
                  <p className="text-sm text-slate-600">Join with nearby communities to share costs and bring top talent</p>
                </div>
              </div>
            </div>
          </section>

          {/* Future Vision */}
          <section className="card p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Globe className="text-white" size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Future Vision</h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-teal-400 rounded-full mb-6" />
            <p className="text-slate-300 leading-relaxed text-lg mb-4">
              Following our initial US operations, we plan to expand to encompass global Jewish communities.
              Every talent who travels abroad returns home enriched by the diversity of Jewish life, becoming
              a bridge builder and agent of change within Israeli society itself.
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Our long-term ambition is to serve as the <span className="text-white font-semibold">global hub for Jewish culture</span> and
              become a comprehensive platform featuring an online culture magazine, culinary guide, and annual festival.
              Kolamba will transform the Jewish world into a vibrant global village, strengthening Jewish identity
              and shaping the next generation of Jewish connection.
            </p>
          </section>

          {/* The Team */}
          <section className="card p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Users className="text-white" size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">The Team</h2>
            </div>
            <div className="divider-gradient mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Avital */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src="/team/avital-indig.jpg"
                    alt="Avital Indig"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Avital Indig</h3>
                <p className="text-primary-600 font-medium mb-3">Founder & CEO</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Award-winning journalist with expertise in culture and diaspora coverage.
                  Holds an M.A. in American Jewish Studies and serves as a delegate to the World Zionist Congress.
                </p>
              </div>

              {/* Avi */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src="/team/avi-luvchik.jpeg"
                    alt="Avi Luvchik"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Avi Luvchik</h3>
                <p className="text-primary-600 font-medium mb-3">Head of Technology</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tech entrepreneur with expertise in digital transformation and platform development.
                  With a PhD in Physics from Imperial College London and experience leading technology
                  initiatives, Avi builds the digital infrastructure connecting Israeli artists with
                  Jewish communities worldwide.
                </p>
              </div>

              {/* Einat */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src="/team/einat-kapach.jpg"
                    alt="Einat Kapach"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Einat Kapach</h3>
                <p className="text-primary-600 font-medium mb-3">Content Development Manager</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Content creator, screenwriter, and director. Former External Relations Head at
                  Ma&apos;aleh Film School, focusing on cinema and identity education.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="card p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Have questions about Kolamba? Want to learn more about how we can help your community
              discover amazing Jewish talent? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:contact@kolamba.org"
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
