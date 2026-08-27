export const HeroArt = () => {
  return (
    <div className="relative mx-auto w-full flex items-center justify-center">
      {/* Background Subtle Soft Glow */}
      <div className="brand-gradient absolute -inset-3 rotate-1 rounded-2xl opacity-15 blur-2xl" />

      {/* Main Clean Showcase Frame */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xl">
        <div className="relative overflow-hidden rounded-xl bg-slate-900 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80"
            alt="Interactive Online Learning Workspace"
            className="w-full h-72 sm:h-96 object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
};
