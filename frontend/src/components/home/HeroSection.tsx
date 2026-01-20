"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { language } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dark gradient background - matching kolamba.org */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a3a4a]"></div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#ca7283]/5 to-[#53b9cc]/10"></div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* KOLAMBA Logo Image */}
        <div className="mb-8 animate-fade-in-up">
          <Image
            src="/kolamba_logo.png"
            alt="KOLAMBA - The Jewish Culture Club"
            width={600}
            height={200}
            priority
            className="w-[300px] md:w-[450px] lg:w-[600px] h-auto"
          />
        </div>

        {/* Bilingual Tagline - side by side like kolamba.org */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-12 animate-fade-in-up delay-200">
          {/* Hebrew tagline */}
          <div className="text-right">
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              כל
            </p>
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              העולם
            </p>
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              במה
            </p>
          </div>

          {/* Divider line */}
          <div className="w-px h-20 md:h-24 bg-white/30"></div>

          {/* English tagline */}
          <div className="text-left">
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              ALL
            </p>
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              THE WORLD&apos;S
            </p>
            <p className="text-white text-lg md:text-2xl lg:text-3xl font-light leading-tight">
              A STAGE
            </p>
          </div>
        </div>

        {/* Join Us Button - matching kolamba.org style */}
        <Link
          href="/register/community"
          className="group flex items-center gap-3 px-8 py-4 bg-[#1a1a2e] hover:bg-[#2a2a3e] border border-white/20 hover:border-white/40 text-white rounded-lg font-medium transition-all duration-300 animate-fade-in-up delay-300"
        >
          <span>{language === 'he' ? 'הצטרפו אלינו' : 'Join Us'}</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Bottom gradient fade for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#53b9cc]/20 to-transparent"></div>
    </section>
  );
}
