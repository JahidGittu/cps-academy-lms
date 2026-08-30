import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { strapiHost } from '@/lib/api';

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  const clean = url.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean.startsWith('/')) {
    return `${strapiHost}${clean}`;
  }
  return `${strapiHost}/${clean}`;
};

export const CourseCover = ({
  title,
  url,
  className = 'h-40',
}: {
  title: string;
  url?: string | null;
  className?: string;
}) => {
  const [loadError, setLoadError] = useState(false);
  const resolved = url ? resolveImageUrl(url) : '';

  if (!resolved || loadError) {
    return (
      <div
        className={`relative w-full overflow-hidden brand-gradient flex items-center justify-center p-4 text-center ${className}`}
      >
        <div className="flex flex-col items-center justify-center text-white/95">
          <BookOpen className="size-8 mb-1.5 opacity-70" />
          <span className="text-xs font-bold line-clamp-2 px-2 text-white drop-shadow-xs">
            {title}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-slate-950 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setLoadError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
    </div>
  );
};
