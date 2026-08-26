import { GraduationCap, PenSquare, ShieldCheck, UserCog } from 'lucide-react';

// The roles are worth a section of their own: what an account may do is decided by the API, not by
// which buttons this site happens to render.
const roles = [
  {
    icon: GraduationCap,
    name: 'Student',
    can: 'Browse the catalogue, enrol, read lessons in order, take the quiz and watch their own progress.',
  },
  {
    icon: PenSquare,
    name: 'Instructor',
    can: 'Create courses, write the lessons and the quiz, and see the roster of who is how far along.',
  },
  {
    icon: UserCog,
    name: 'Content Manager',
    can: 'Everything an instructor can do on any course, plus writing and publishing the blog.',
  },
  {
    icon: ShieldCheck,
    name: 'Admin',
    can: 'Change what role an account holds, and read the platform totals nobody else can see.',
  },
];

export const Roles = () => (
  <section className="border-y border-slate-200 bg-white">
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Who can do what</h2>
      <p className="mt-2 max-w-xl text-slate-600">
        Every write is checked against the account making it. Hiding a button is a courtesy; the
        refusal happens in the API either way.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map(({ icon: Icon, name, can }) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
              <Icon className="size-4" />
            </span>

            <h3 className="mt-4 font-medium">{name}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{can}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
