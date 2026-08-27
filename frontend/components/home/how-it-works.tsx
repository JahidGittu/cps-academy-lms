const steps = [
  {
    title: 'Make an account',
    body: 'It takes a moment and puts you in as a student. Nothing to pay and no card to hand over.',
  },
  {
    title: 'Enrol in a course',
    body: 'Browsing is open to everyone. Enrolling is what opens the lesson bodies and the quiz.',
  },
  {
    title: 'Work down the syllabus',
    body: 'One lesson at a time, video or written. Mark it done and the next one opens.',
  },
  {
    title: 'Sit the quiz',
    body: 'Answer the questions and get your score back straight away. It is kept, so you can look it up again.',
  },
];

export const HowItWorks = () => (
  <section className="mx-auto w-full max-w-6xl px-4 py-16">
    <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
    <p className="mt-2 max-w-xl text-slate-600">
      Four steps from a visitor to a finished course, and none of them take longer than an evening.
    </p>

    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {index + 1}
          </span>

          <h3 className="mt-4 font-medium">{step.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
        </li>
      ))}
    </ol>
  </section>
);
