import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// One button. Everything above this points at the catalogue, and the account gets made on the course
// page itself once a visitor has picked something, so asking for one here as well was just noise.
export const CallToAction = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20">
    <div className="brand-gradient flex flex-col items-start gap-5 rounded-2xl px-8 py-12 text-white sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-semibold">Pick a course and start tonight</h2>

        <p className="mt-1.5 text-sm text-white/80">
          Read the syllabus first. The account takes a minute and you make it on the way in.
        </p>
      </div>

      <Link
        href="/courses"
        className="group ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
      >
        Browse courses
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  </section>
);
