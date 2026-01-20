"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const { t, language, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            {language === 'he' ? 'נשלח בהצלחה!' : 'Email Sent!'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {language === 'he'
              ? `אם קיים חשבון עבור ${email}, תקבל הוראות לאיפוס סיסמה.`
              : `If an account exists for ${email}, you will receive password reset instructions.`}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            {language === 'he' ? 'חזרה להתחברות' : 'Back to Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="bg-brand-gradient p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            {language === 'he' ? 'שכחת סיסמה?' : 'Forgot Password?'}
          </h1>
          <p className="text-white/80">
            {language === 'he'
              ? 'הזן את האימייל שלך ונשלח לך קישור לאיפוס'
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
        </div>

        <div className="p-6 md:p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-6"
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {language === 'he' ? 'חזרה להתחברות' : 'Back to Login'}
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-neutral-700 mb-2">
                <Mail className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                {t.auth.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {language === 'he' ? 'שולח...' : 'Sending...'}
                </>
              ) : (
                language === 'he' ? 'שלח קישור לאיפוס' : 'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
