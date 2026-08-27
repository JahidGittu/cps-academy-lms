import { GraduationCap, ShieldCheck, UserCog } from 'lucide-react';

// The roles used to be a section of their own reading like a permission table, which is a thing a
// reviewer wants and a learner does not. Same four accounts, told as who wrote the course you are
// about to take.
const people = [
  {
    icon: GraduationCap,
    name: 'Instructors',
    body: 'Write the lessons and the quiz on their own courses, and can see how far each student has got.',
  },
  {
    icon: UserCog,
    name: 'Content managers',
    body: 'Look after the library as a whole and write the posts on the blog.',
  },
  {
    icon: ShieldCheck,
    name: 'Admins',
    body: 'Decide which accounts are allowed to teach, and are the only ones who can.',
  },
];

export const Teaching = () => (
  <section className="border-t border-slate-200 bg-white">
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Who is behind the courses</h2>
      <p className="mt-2 max-w-xl text-slate-600">
        Every account is one of four kinds, and what it may do is settled by the API rather than by
        which buttons happen to be on the screen.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {people.map(({ icon: Icon, name, body }) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
              <Icon className="size-4" />
            </span>

            <h3 className="mt-4 font-medium">{name}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Signing up makes you a student. If you are here to teach, an admin moves your account across.
      </p>
    </div>
  </section>
);
