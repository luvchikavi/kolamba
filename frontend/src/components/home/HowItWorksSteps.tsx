"use client";

import { Search, Calendar, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "DISCOVER",
    description: "Browse our curated selection of Israeli talents. Filter by category, language, and availability to find the perfect match for your event.",
    color: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    number: "02",
    icon: Calendar,
    title: "BOOK",
    description: "Send a booking request with your event details. Talents respond directly, and Kolamba helps coordinate tours to reduce costs for everyone.",
    color: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "EXPERIENCE",
    description: "Enjoy an unforgettable cultural event. From concerts to workshops, bring Israeli culture to your community and create lasting connections.",
    color: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

export default function HowItWorksSteps() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/3 top-0 text-teal-400 opacity-40 text-xl hidden md:block">
            ~
          </div>
          <div className="absolute right-1/3 top-0 text-pink-400 opacity-40 text-xl hidden md:block">
            ,~
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            HOW IT WORKS
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line (on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-slate-200" />
                )}

                <div className={`${step.color} rounded-3xl p-8 text-center relative z-10`}>
                  {/* Step Number */}
                  <div className="text-6xl font-serif font-bold text-slate-200 mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm`}>
                    <Icon size={28} className={step.iconColor} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
