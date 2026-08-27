import { ChevronDown } from 'lucide-react';

const questions = [
  {
    q: 'Does a course cost anything?',
    a: 'No. Enrolment is open and there is nothing to pay on the platform.',
  },
  {
    q: 'Can I look at a course before making an account?',
    a: 'Yes. The description and the full list of lessons are open to read. Enrolling is what opens the lesson bodies and the quiz.',
  },
  {
    q: 'Why can I not skip to the lesson I want?',
    a: 'A lesson opens once the one before it is marked done. Courses here are written to be worked through in order, so the syllabus stops at the lesson you are on.',
  },
  {
    q: 'What happens after I submit a quiz?',
    a: 'You get the score back straight away. It is stored with the answers you gave, so you can look the attempt up again later from the course.',
  },
  {
    q: 'How do I teach a course here?',
    a: 'A new account is a student. Courses are written by instructors and content managers, and an admin is the one who moves an account across.',
  },
];

export const Faq = () => (
  <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
    <div className="text-center mb-8">
      <span className="inline-block rounded bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700 mb-3">
        FAQ
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
    </div>

    <div className="space-y-2.5">
      {questions.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-md border border-slate-200 bg-white px-5 py-3.5 shadow-2xs open:border-brand-300 transition-colors"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800 text-sm">
            {q}
            <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
          </summary>

          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  </section>
);
