import { UserPlus, BookOpen, Layers, Award } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    body: 'Quick sign up to start learning. No credit card required.',
    badgeClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: BookOpen,
    title: 'Enroll in Courses',
    body: 'Browse all available tracks and enroll to unlock lesson content.',
    badgeClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Layers,
    title: 'Sequential Lessons',
    body: 'Learn step-by-step. Completing each lesson unlocks the next.',
    badgeClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },
  {
    icon: Award,
    title: 'Take the Quiz',
    body: 'Validate your knowledge with an auto-graded MCQ assessment.',
    badgeClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
];

export const HowItWorks = () => (
  <section className="border-b border-theme bg-canvas py-20 transition-colors duration-200">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          How Learning Works
        </h2>
        <p className="mt-3 text-secondary text-base">
          A structured learning path designed for maximum retention and steady progress.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="group relative rounded-xl border border-theme bg-surface p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-active hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className={`flex size-10 items-center justify-center rounded-lg border ${step.badgeClass} shadow-2xs`}>
                  <Icon className="size-5" />
                </span>
                <span className="text-lg font-black text-muted group-hover:text-brand transition-colors">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-5 font-bold text-primary text-base group-hover:text-brand transition-colors">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                {step.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
