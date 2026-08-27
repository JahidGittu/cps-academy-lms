import { CheckCircle2, Award, BookOpen, Layers } from 'lucide-react';

export const HeroArt = () => {
  const cards = [
    {
      title: 'Postgres Architecture',
      subtitle: 'Course: Database Systems',
      icon: BookOpen,
      badge: 'In Progress',
      badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
      progress: 'Lesson 3 of 4',
      percent: 75,
      tilt: 'lg:-rotate-1',
    },
    {
      title: 'SQL Assessment Check',
      subtitle: 'Auto-Graded MCQ',
      icon: Award,
      badge: 'Passed · 100%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      progress: '4 of 4 correct',
      percent: 100,
      tilt: 'lg:rotate-2 lg:translate-x-3',
    },
    {
      title: 'Schema Normalization',
      subtitle: 'Sequential Track',
      icon: Layers,
      badge: 'Next Up',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      progress: 'Syllabus Unlocked',
      percent: 30,
      tilt: 'lg:-rotate-2',
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none animate-float">
      {/* Background glow behind stack */}
      <div className="brand-gradient absolute -inset-2 rotate-1 rounded-2xl opacity-30 blur-xl transition-all duration-300 group-hover:opacity-50" />
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 opacity-20" />

      <div className="relative space-y-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group flex items-start gap-3.5 rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-brand-500/50 hover:bg-slate-800/90 ${card.tilt}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-300 shadow-xs">
                <Icon className="size-5" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">{card.title}</h4>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${card.badgeColor}`}>
                    {card.badge.includes('Passed') && <CheckCircle2 className="size-3" />}
                    {card.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                    <span>{card.progress}</span>
                    <span className="text-slate-200 font-semibold">{card.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="brand-gradient h-full rounded-full transition-all duration-500"
                      style={{ width: `${card.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
