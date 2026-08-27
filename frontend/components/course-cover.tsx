import { BookOpen } from 'lucide-react';

// A cover is a URL somebody types into the course form, so most courses will not have one until
// somebody bothers. An empty grey box reads as a broken image, so the fallback draws itself: a
// gradient picked off the title, which means the same course keeps the same colour everywhere and a
// card stays recognisable in a list.
const palettes = [
  'from-brand-600 to-violet-600',
  'from-sky-500 to-brand-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-fuchsia-600',
];

const palette = (title: string) => {
  // A plain sum of the letters gave two of the three seeded courses the same colour, since it does
  // not care what order they came in. Multiplying as it goes does.
  let hash = 0;

  for (const character of title) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 9973;

  return palettes[hash % palettes.length];
};

const initials = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export const CourseCover = ({
  title,
  url,
  className = 'h-40',
}: {
  title: string;
  url?: string | null;
  className?: string;
}) =>
  url ? (
    // A plain img, not next/image. The host is whatever the author pasted in, and next/image wants
    // every host it will ever see listed in next.config, which is a list nobody can keep up to date.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`w-full object-cover ${className}`} />
  ) : (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${palette(title)} ${className}`}
    >
      <BookOpen className="absolute -bottom-5 -right-4 size-24 text-white/15" />

      <span className="text-2xl font-semibold tracking-widest text-white/90">
        {initials(title)}
      </span>
    </div>
  );
