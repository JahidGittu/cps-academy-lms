import { ClipboardCheck, GraduationCap, LineChart, ListOrdered } from 'lucide-react';

// The hero needs something to look at. What an LMS has to show is not a photograph of somebody at a
// laptop, it is the three things it does to you while you work through a course, so the picture is
// those three, tilted so the stack reads as an illustration rather than another list.
const cards = [
  {
    icon: ListOrdered,
    title: 'Lessons in order',
    body: 'The next one opens when this one is marked done',
    tilt: '-rotate-2',
  },
  {
    icon: ClipboardCheck,
    title: 'A quiz at the end',
    body: 'Marked the moment you hand it in',
    tilt: 'rotate-1 sm:ml-8',
  },
  {
    icon: LineChart,
    title: 'Progress that sticks',
    body: 'Counted per lesson and kept on your account',
    tilt: '-rotate-1 sm:ml-3',
  },
];

export const HeroArt = () => (
  <div className="relative mx-auto w-full max-w-sm">
    {/* The slab the cards sit on. Rotated the other way, so the stack has an edge to lean against. */}
    <div className="brand-gradient absolute -inset-3 rotate-3 rounded-[2rem] shadow-xl shadow-brand-600/25" />

    <div className="relative space-y-3 py-2">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-lg">
        <GraduationCap className="size-6 text-brand-600" />
      </span>

      {cards.map(({ icon: Icon, title, body, tilt }) => (
        <div
          key={title}
          className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ${tilt}`}
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="size-4" />
          </span>

          <div>
            <p className="text-sm font-medium text-slate-900">{title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
