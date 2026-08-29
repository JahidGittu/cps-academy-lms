export const DEFAULT_COVERS: Record<string, string> = {
  'Web Development: HTML, CSS & JavaScript Masterclass': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'SQL Foundations': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
  'Postgres in Production': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'Designing a Schema': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
};

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80';

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337').replace(/\/api\/?$/, '');
    return `${strapiBase}${url}`;
  }
  return url;
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
  const resolved = url ? resolveImageUrl(url) : DEFAULT_COVERS[title] || FALLBACK_IMAGE;

  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
    </div>
  );
};
