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
  <section className="border-b border-theme bg-canvas py-20 transition-colors duration-200">
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Everything you need to know about the CPS Academy LMS platform.
        </p>
      </div>

      <div className="space-y-3">
        {questions.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-theme bg-surface px-5 py-4 shadow-sm open:border-active open:shadow-md hover:border-active/60 transition-all cursor-pointer"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-primary text-sm sm:text-base">
              {q}
              <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180 group-open:text-brand" />
            </summary>

            <p className="mt-3 text-sm text-secondary leading-relaxed border-t border-subtle pt-3">
              {a}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
