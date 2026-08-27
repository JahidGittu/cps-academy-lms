import { Check } from 'lucide-react';

// Written from the learner's side of the screen. Each one is a thing the platform does for you, not
// a thing the code does; where that happens is the README's business and the video's.
const reasons = [
  {
    title: 'You always know what is next',
    body: 'The syllabus stops at the lesson you are on, so a week away does not turn into an evening of working out where you were.',
  },
  {
    title: 'Nothing to keep track of yourself',
    body: 'Your percentage is counted from the lessons you finished, so it is right every time you open the page.',
  },
  {
    title: 'A mark you can go back to',
    body: 'A quiz is graded the moment you hand it in, and the score is kept with the answers you gave.',
  },
];

export const WhyFinish = () => (
  <section className="border-y border-slate-200 bg-slate-900">
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Built around finishing, not signing up
        </h2>

        <p className="mt-3 text-slate-300">
          Most courses get abandoned somewhere in the middle. The way this one is put together is
          meant to make the middle easier: one lesson open at a time, and a record of everything you
          have already done.
        </p>
      </div>

      <ul className="space-y-5">
        {reasons.map((reason) => (
          <li key={reason.title} className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
              <Check className="size-3.5" />
            </span>

            <div>
              <h3 className="font-medium text-white">{reason.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{reason.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
