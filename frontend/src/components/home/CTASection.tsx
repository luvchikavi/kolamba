"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

export default function CTASection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          message: formData.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setFormData({ fullName: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0C1719 0%, #1a2e35 40%, #2a1f24 70%, #0C1719 100%)" }}>
      {/* Decorative arcs matching design */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 600">
        <ellipse cx="-100" cy="100" rx="500" ry="600" fill="none" stroke="#53B9CC" strokeWidth="1" opacity="0.25" />
        <ellipse cx="-50" cy="150" rx="400" ry="500" fill="none" stroke="#53B9CC" strokeWidth="1" opacity="0.15" />
        <ellipse cx="1500" cy="500" rx="400" ry="500" fill="none" stroke="#8E96AB" strokeWidth="1" opacity="0.2" />
        <ellipse cx="1400" cy="550" rx="350" ry="400" fill="none" stroke="#CA7283" strokeWidth="1" opacity="0.15" />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-12 max-w-4xl mx-auto">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-accent-500 to-primary-500 opacity-50" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold italic text-white sm:whitespace-nowrap uppercase">
            Contact Us
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500 opacity-50" />
        </div>

        {/* Form in rounded container */}
        <div className="max-w-3xl mx-auto">
          <div className="border border-white/20 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5">
                  <input
                    type="text"
                    placeholder="Full name*"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-neutral-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email*"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-neutral-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                  />
                </div>
                <textarea
                  placeholder="What's on your mind?"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full h-full px-5 py-4 bg-neutral-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none transition-all min-h-[130px]"
                />
              </div>
            </form>
          </div>
          <div className="text-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={(e) => {
                const form = e.currentTarget.closest("section")?.querySelector("form");
                if (form) form.requestSubmit();
              }}
              className="px-12 py-3.5 rounded-full font-bold text-white uppercase tracking-wider text-sm transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #CA7283 0%, #53B9CC 100%)" }}
            >
              {isSubmitting ? "Sending..." : "SEND"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
