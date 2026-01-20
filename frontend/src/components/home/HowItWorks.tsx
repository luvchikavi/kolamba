"use client";

import { Search, MessageSquare, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowItWorks() {
  const { t, isRTL } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: t.howItWorks.searchTitle,
      description: t.howItWorks.searchDescription,
    },
    {
      icon: MessageSquare,
      title: t.howItWorks.contactTitle,
      description: t.howItWorks.contactDescription,
    },
    {
      icon: Calendar,
      title: t.howItWorks.performanceTitle,
      description: t.howItWorks.performanceDescription,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            {t.howItWorks.title}
          </h2>
          <div className="h-0.5 w-32 bg-brand-gradient mx-auto"></div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className={`hidden md:block absolute top-12 w-full h-0.5 bg-neutral-200 z-0 ${isRTL ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`}></div>
                )}

                <div className="relative z-10">
                  {/* Step number */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="text-primary-600" size={40} />
                  </div>

                  {/* Step indicator */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                    {index + 1}
                  </div>

                  <h3 className="text-xl font-bold text-neutral-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
