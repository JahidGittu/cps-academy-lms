export const HeroArt = () => {
  return (
    <div className="relative mx-auto w-full flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-illustration.png"
        alt="Online Learning Illustration"
        className="w-full h-auto max-h-[460px] object-contain rounded-md"
      />
    </div>
  );
};
