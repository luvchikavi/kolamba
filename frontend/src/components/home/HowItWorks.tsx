"use client";

import { Search, MessageSquare, Calendar, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Artists",
    description: "Browse our curated selection of Israeli artists by category, location, or availability.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: MessageSquare,
    title: "Connect",
    description: "Send a booking request with your event details and requirements directly to the artist.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Calendar,
    title: "Book & Coordinate",
    description: "Confirm the date, finalize details, and prepare for an unforgettable cultural experience.",
    color: "from-primary-500 to-teal-500",
  },
  {
    icon: CheckCircle,
    title: "Host Your Event",
    description: "Welcome your artist and create lasting memories for your community.",
    color: "from-accent-500 to-rose-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="section bg-slate-50">
      <div className="container-default">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Booking an artist for your community event is simple and straightforward
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-slate-200">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                )}

                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-soft-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">{index + 1}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
