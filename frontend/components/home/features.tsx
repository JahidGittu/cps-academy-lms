import { BookOpen, ClipboardCheck, LineChart, Newspaper } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Lessons in order',
    body: 'A lesson opens once the one before it is marked done, so a course is worked through rather than skimmed.',
  },
  {
    icon: ClipboardCheck,
    title: 'Quizzes marked on the server',
    body: 'The answer key never leaves the backend. The browser sends choices and gets back a score.',
  },
  {
    icon: LineChart,
    title: 'Progress worth trusting',
    body: 'Completion is counted from the lessons you finished, so it cannot drift out of date.',
  },
  {
    icon: Newspaper,
    title: 'A blog with drafts',
    body: 'Managers write posts and keep them unpublished until they are ready. Visitors only ever see the published ones.',
  },
];

export const Features = () => (
  <section className="mx-auto w-full max-w-6xl px-4 py-16">
    <h2 className="text-2xl font-semibold tracking-tight">What is inside</h2>
    <p className="mt-2 max-w-xl text-slate-600">
      Four things the platform does, and the reason each one is done on the server rather than in the
      browser.
    </p>

    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {features.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="size-5" />
          </span>

          <h3 className="mt-4 font-medium">{title}</h3>
          <p className="mt-1.5 text-sm text-slate-600">{body}</p>
        </div>
      ))}
    </div>
  </section>
);
