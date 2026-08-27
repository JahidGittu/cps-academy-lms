import { UserPlus, BookOpen, Layers, Award } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    body: 'Quick sign up to start learning. No credit card required.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: BookOpen,
    title: 'Enroll in Courses',
    body: 'Browse all available tracks and enroll to unlock lesson content.',
    color: 'text-violet-600 bg-violet-50 border-violet-100',
  },
  {
    icon: Layers,
    title: 'Sequential Lessons',
    body: 'Learn step-by-step. Completing each lesson unlocks the next.',
    color: 'text-sky-600 bg-sky-50 border-sky-100',
  },
  {
    icon: Award,
    title: 'Take the Quiz',
    body: 'Validate your knowledge with an auto-graded MCQ assessment.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

export const HowItWorks = () => (
  <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-8">
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-block rounded-md bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700">
        Simple 4-Step Process
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        How Learning Works
      </h2>
      <p className="mt-3 text-slate-600 text-base">
        A structured learning path designed for maximum retention and steady progress.
      </p>
    </div>

    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div
            key={step.title}
            className="group relative rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className={`flex size-10 items-center justify-center rounded-lg border ${step.color} shadow-2xs`}>
                <Icon className="size-5" />
              </span>
              <span className="text-xl font-black text-slate-200 group-hover:text-brand-300 transition-colors">
                0{index + 1}
              </span>
            </div>

            <h3 className="mt-5 font-semibold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {step.body}
            </p>
          </div>
        );
      })}
    </div>
  </section>
);
