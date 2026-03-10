"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the tour work?",
    answer:
      "A tour is launched when an artist opens a tour on Kolamba by setting their availability, regions, and base fee. The tour becomes confirmed once a minimum number of bookings is reached, making it financially viable. From that point on, additional communities can join the route and book the artist as part of the same tour. Kolamba continuously optimizes the schedule and routing to maximize impact, efficiency, and earnings for everyone.",
  },
  {
    question: "Who is paying for the artist's flight?",
    answer:
      "Travel costs are typically shared among all participating hosts on a tour. The more hosts that join, the lower the cost per host. Kolamba helps coordinate this cost-sharing to ensure fair distribution based on distance and tour logistics.",
  },
  {
    question: "What happens if the artist cancels?",
    answer:
      "In any event of a cancellation, Kolamba will work to find a suitable replacement talent or offer a full refund. Our booking agreements include clear cancellation policies to protect both hosts and talents.",
  },
  {
    question: "Is signing up free?",
    answer:
      "Yes, signing up for Kolamba is completely free. Kolamba only charges a fee when you book a talent, which is a percentage of the booking amount.",
  },
];

export default function HowItWorks() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-accent-500 to-primary-500" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold italic text-slate-900 whitespace-nowrap">
            {"Common Q&A"}
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100"
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
                  className={`text-slate-400 transition-transform flex-shrink-0 ml-4 ${
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
