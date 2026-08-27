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
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0c3947] via-[#0f4b5c] to-[#145d70] p-8 sm:p-12 text-white shadow-lg shadow-teal-950/20 border border-teal-800/40">
        <div className="relative mx-auto max-w-2xl text-center">
          {/* Main Title - Crisp and Sharp */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ready to start your premium learning experience?
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-xs sm:text-sm text-teal-100/90 max-w-md mx-auto leading-relaxed">
            Subscribe to our newsletter and get a 15% discount on your first course enrollment.
          </p>

          {/* Newsletter Input + Subscribe Button with reduced roundness & zero blur */}
          {subscribed ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#06242c] border border-teal-400/40 px-5 py-2.5 text-sm font-semibold text-teal-200">
              <Check className="size-4 text-emerald-400" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto w-full"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full sm:w-72 rounded-md border border-teal-500/40 bg-[#06242c] px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:border-teal-300 focus:ring-2 focus:ring-teal-400/20"
              />

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 hover:shadow active:translate-y-0.5 shrink-0 cursor-pointer"
              >
                <Send className="size-4 text-slate-900" />
                <span>Subscribe</span>
              </button>
            </form>
          )}

          {/* Sub-link */}
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-200 hover:text-white transition-colors"
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
