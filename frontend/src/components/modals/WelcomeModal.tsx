"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smile, X } from "lucide-react";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem("kolamba_welcome_modal_seen");
    if (!hasSeenModal) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("kolamba_welcome_modal_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Smiley Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-pink-300 flex items-center justify-center">
          <Smile size={40} className="text-pink-400" />
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          IT&apos;S NICE TO MEET YOU!
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-lg mb-8 uppercase tracking-wide">
          IT SEEMS WE HAVEN&apos;T OFFICIALLY MET, WOULD YOU LIKE TO
          <br />
          SIGN UP AND GET 10% DISCOUNT ON YOUR FIRST SHOW?
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleClose}
            className="px-8 py-3.5 border-2 border-slate-900 text-slate-900 rounded-full font-semibold hover:bg-slate-50 transition-colors uppercase tracking-wide"
          >
            Continue as Guest
          </button>
          <Link
            href="/register/host"
            onClick={() => localStorage.setItem("kolamba_welcome_modal_seen", "true")}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors uppercase tracking-wide"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
