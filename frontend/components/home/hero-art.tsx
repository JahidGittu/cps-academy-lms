import { Users, Trophy, Award, Star } from 'lucide-react';

export const HeroArt = () => {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none flex items-center justify-center">
      {/* Background Soft Pastel Container */}
      <div className="relative w-full rounded-2xl bg-gradient-to-tr from-sky-100/60 via-indigo-50/50 to-brand-50/70 p-4 sm:p-6 border border-slate-200/80 shadow-md">
        {/* Main Photo Visual */}
        <div className="relative overflow-hidden rounded-xl bg-white shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
            alt="Students collaborating and coding together"
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        </div>

        {/* Floating Badge 1: Top-Left (Active Students) */}
        <div className="absolute -left-3 top-[12%] sm:-left-6 hidden sm:block animate-float">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="size-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active Students</p>
              <p className="text-sm font-extrabold text-brand-700">10,000+</p>
            </div>
          </div>
        </div>

        {/* Floating Badge 2: Top-Right (Lessons count) */}
        <div className="absolute -right-3 top-[6%] sm:-right-6 hidden sm:block">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Trophy className="size-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">120+</p>
              <p className="text-[10px] font-medium text-slate-500">Lessons</p>
            </div>
          </div>
        </div>

        {/* Floating Badge 3: Bottom-Right (Completion Rate) */}
        <div className="absolute -right-3 bottom-[12%] sm:-right-6 hidden sm:block animate-float">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Award className="size-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</p>
              <p className="text-sm font-extrabold text-emerald-700">95%</p>
            </div>
          </div>
        </div>

        {/* Floating Badge 4: Bottom-Left (Star Rating) */}
        <div className="absolute -left-3 bottom-[6%] sm:-left-6 hidden sm:block">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md">
            <Star className="size-4 text-amber-400 fill-amber-400" />
            <p className="text-xs font-bold text-slate-800">4.9 Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};
