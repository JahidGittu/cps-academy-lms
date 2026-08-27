export const HeroArt = () => {
  return (
    <div className="relative mx-auto w-full flex items-center justify-center">
      {/* Background Subtle Soft Glow */}
      <div className="brand-gradient absolute -inset-2 rotate-1 rounded-lg opacity-15 blur-xl" />

      {/* Main Clean Showcase Frame with User Uploaded Illustration */}
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-200/90 bg-white p-2 sm:p-3 shadow-lg">
        <div className="relative overflow-hidden rounded-md bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-illustration.png"
            alt="Online Learning Illustration"
            className="w-full h-auto max-h-[420px] object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>
    </div>
  );
};
