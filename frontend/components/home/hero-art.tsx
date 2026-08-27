import { BookOpen, Terminal, CheckCircle2, Award } from 'lucide-react';

export const HeroArt = () => {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Background Ambient Glow */}
      <div className="brand-gradient absolute -inset-2 rotate-1 rounded-2xl opacity-25 blur-2xl" />
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-600 opacity-20" />

      {/* Main Glass Classroom Showcase Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400">CPS Academy · Course Preview</span>
          <div className="size-2.5" />
        </div>

        {/* High-res Technology Hero Banner */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80"
            alt="Programming & Database Architecture"
            className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Course Info inside banner */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                <BookOpen className="size-3" />
                <span>Curriculum Track</span>
              </span>
              <h3 className="mt-1 text-base font-bold text-white tracking-tight">
                SQL & Database Engineering
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-slate-300">
              5 Lessons · 1 Quiz
            </span>
          </div>
        </div>

        {/* Code & Feature Highlight Footer */}
        <div className="p-4 bg-slate-900/95 space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300 border border-slate-800">
            <Terminal className="size-3.5 text-brand-400 shrink-0" />
            <span className="text-slate-400">SELECT</span>
            <span className="text-emerald-400">title, status</span>
            <span className="text-slate-400">FROM</span>
            <span className="text-indigo-400">curriculum;</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5 text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Step-by-step Lessons</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5 text-slate-300">
              <Award className="size-4 text-violet-400 shrink-0" />
              <span>Auto-Graded Quizzes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
