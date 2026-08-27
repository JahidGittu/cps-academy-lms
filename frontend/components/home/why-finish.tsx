import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

const reasons = [
  {
    icon: Zap,
    title: 'Never lose your place',
    body: 'Your progress is tracked dynamically at lesson level. Pick up right where you left off at any time.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified mastery',
    body: 'Lessons must be completed in order, ensuring you build foundational skills before advancing.',
  },
  {
    icon: Sparkles,
    title: 'Instant auto-grading',
    body: 'Test your understanding immediately with immediate server-evaluated scores and results stored permanently.',
  },
];

export const WhyFinish = () => (
  <section className="relative overflow-hidden bg-slate-950 text-white py-20 border-y border-slate-800">
    {/* Ambient blur accents */}
    <div className="pointer-events-none absolute -right-20 top-0 size-80 rounded-full bg-brand-600/15 blur-3xl" />
    <div className="pointer-events-none absolute left-0 bottom-0 size-80 rounded-full bg-violet-600/15 blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5">
        <span className="inline-block rounded bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 text-xs font-semibold text-brand-300">
          Built for Completion
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Designed to help you <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">reach 100%</span>
        </h2>

        <p className="mt-4 text-slate-300 text-base leading-relaxed">
          Most online courses are left halfway through. Our platform removes friction with sequential pacing, verified progress, and instant feedback.
        </p>
      </div>

      <div className="lg:col-span-7 space-y-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <div 
              key={reason.title} 
              className="flex items-start gap-4 rounded-md border border-slate-800/80 bg-slate-900/60 p-4.5 backdrop-blur transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Icon className="size-4" />
              </span>

              <div>
                <h3 className="font-semibold text-white text-base">{reason.title}</h3>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">{reason.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
