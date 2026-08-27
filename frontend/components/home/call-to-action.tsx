'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Check } from 'lucide-react';

export const CallToAction = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c3947] via-[#0f4b5c] to-[#145d70] p-10 sm:p-14 text-white shadow-xl shadow-teal-950/20">
        {/* Subtle Decorative Ambient Circles matching image */}
        <div className="pointer-events-none absolute -top-10 -right-10 size-44 rounded-full bg-teal-300/10 blur-xs" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-44 rounded-full bg-teal-300/10 blur-xs" />
        <div className="pointer-events-none absolute top-1/2 right-8 size-20 rounded-full bg-teal-200/5 blur-xs" />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Main Title matching image */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ready to start your premium learning experience?
          </h2>

          {/* Subtitle matching image */}
          <p className="mt-3 text-xs sm:text-sm text-slate-200/90 max-w-md mx-auto leading-relaxed">
            Subscribe to our newsletter and get a 15% discount on your first course enrollment.
          </p>

          {/* Newsletter Input + Subscribe Button matching image */}
          {subscribed ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-900/60 border border-teal-300/30 px-6 py-2.5 text-sm text-teal-100">
              <Check className="size-4 text-emerald-400" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto w-full"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full sm:w-72 rounded-full border border-teal-200/20 bg-teal-950/30 px-5 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-teal-200/50 focus:bg-teal-950/50 backdrop-blur-sm"
              />

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-slate-100 hover:shadow-lg shrink-0 cursor-pointer"
              >
                <Send className="size-4 text-slate-800" />
                <span>Subscribe</span>
              </button>
            </form>
          )}

          {/* Sub-link matching image */}
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <span>Or browse courses</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
