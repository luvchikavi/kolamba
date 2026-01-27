"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container-default py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing and using Kolamba, you accept and agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              Kolamba is a platform that connects Israeli artists with Jewish communities worldwide.
              We facilitate bookings and communications but are not a party to any agreements between
              artists and communities.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 mb-4">
              To use certain features of our service, you must create an account. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Artist Responsibilities</h2>
            <p className="text-slate-600 mb-4">
              Artists are responsible for the accuracy of their profiles, availability, and pricing.
              Artists agree to honor confirmed bookings and communicate professionally with communities.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Community Responsibilities</h2>
            <p className="text-slate-600 mb-4">
              Communities are responsible for providing accurate event information and timely payment
              as agreed with artists. Communities should communicate booking details clearly.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              Kolamba is not responsible for the actions of artists or communities. We do not guarantee
              the quality of performances or the fulfillment of bookings. Disputes should be resolved
              directly between parties.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes via email or through the platform.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Contact</h2>
            <p className="text-slate-600">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:contact@kolamba.org" className="text-primary-600 hover:text-primary-700">
                contact@kolamba.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
