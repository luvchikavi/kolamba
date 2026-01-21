"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-4">
              We collect information you provide directly to us, including your name, email address,
              location, and any other information you choose to provide when registering as an artist
              or community, or when using our services.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process bookings and facilitate connections between artists and communities</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 mb-4">
              We share information about artists publicly on our platform to help communities find
              and book them. We do not sell or rent your personal information to third parties for
              their marketing purposes.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We implement appropriate technical and organizational measures to protect the security
              of your personal information. However, no method of transmission over the Internet is
              100% secure.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 mb-4">
              You have the right to access, update, or delete your personal information at any time.
              You can do this through your account settings or by contacting us directly.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Contact Us</h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@kolamba.org" className="text-primary-600 hover:text-primary-700">
                privacy@kolamba.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
