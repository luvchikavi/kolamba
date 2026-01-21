"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "HOW DOES THE TOUR WORK?",
    answer:
      "A tour is launched when an artist opens a tour on Kolamba by setting their availability, regions, and base fee. The tour becomes confirmed once a minimum number of bookings is reached, making it financially viable. From that point on, additional communities can join the route and book the artist as part of the same tour. Kolamba continuously optimizes the schedule and routing to maximize impact, efficiency, and earnings for everyone.",
  },
  {
    question: "WHO IS PAYING FOR THE ARTIST'S FLIGHT?",
    answer:
      "Travel costs are typically shared among all participating communities on a tour. The more communities that join, the lower the cost per community. Kolamba helps coordinate this cost-sharing to ensure fair distribution based on distance and tour logistics.",
  },
  {
    question: "WHAT HAPPENS IF THE ARTIST CANCELS?",
    answer:
      "In the rare event of a cancellation, Kolamba will work to find a suitable replacement artist or offer a full refund. Our booking agreements include clear cancellation policies to protect both communities and artists.",
  },
  {
    question: "CAN WE GET SPONSORS FOR THE SHOWS/TOURS",
    answer:
      "Yes! Kolamba can help connect you with potential sponsors for cultural events. Many Jewish organizations, foundations, and businesses are interested in supporting Israeli cultural programming in diaspora communities.",
  },
];

export default function HowItWorks() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight mb-12">
          COMMON Q&A
        </h2>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  {faq.question}
                </h3>
                <ChevronDown
                  size={24}
                  className={`text-slate-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
