import { ClipboardCheck, GraduationCap, LineChart, ListOrdered } from 'lucide-react';

const cards = [
  {
    icon: ListOrdered,
    title: 'Sequential Lessons',
    body: 'Each lesson unlocks once the previous one is finished',
    badge: 'Step-by-step',
    tilt: 'sm:-rotate-2',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: ClipboardCheck,
    title: 'Auto-Graded Quizzes',
    body: 'Instant evaluation with server-side validation',
    badge: 'Real-time score',
    tilt: 'sm:rotate-1 sm:ml-6',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: LineChart,
    title: 'Persistent Progress',
    body: 'Live completion stats synced across all devices',
    badge: 'Always accurate',
    tilt: 'sm:-rotate-1 sm:ml-2',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

export const HeroArt = () => (
  <div className="relative mx-auto w-full max-w-md animate-float">
    {/* Decorative background glow & rotated backdrop */}
    <div className="brand-gradient absolute -inset-2 rotate-2 rounded-3xl opacity-30 blur-xl transition-all duration-300 group-hover:opacity-50" />
    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 opacity-20" />

    <div className="relative space-y-3.5 p-3 sm:p-5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner backdrop-blur border border-white/10">
            <GraduationCap className="size-5 text-brand-300" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Learning Path</p>
            <p className="text-sm font-medium text-white">Full-Stack Curriculum</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          Live Track
        </span>
      </div>

      {cards.map(({ icon: Icon, title, body, badge, tilt, color }) => (
        <div
          key={title}
          className={`group flex items-start gap-3.5 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-500/50 hover:bg-slate-800/90 ${tilt}`}
        >
          <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border ${color}`}>
            <Icon className="size-4.5" />
          </span>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{title}</p>
              <span className="text-[10px] text-slate-400">{badge}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
