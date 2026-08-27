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

// Plain details and summary elements. An accordion is one of the few things a browser already does,
// and doing it here instead would mean a client component holding an index in state.
export const Faq = () => (
  <section className="mx-auto w-full max-w-3xl px-4 py-16">
    <h2 className="text-center text-2xl font-semibold tracking-tight">Questions people ask</h2>

    <div className="mt-8 space-y-3">
      {questions.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm open:border-brand-200"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {q}
            <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
          </summary>

          <p className="mt-3 text-sm text-slate-600">{a}</p>
        </details>
      ))}
    </div>
  </section>
);
