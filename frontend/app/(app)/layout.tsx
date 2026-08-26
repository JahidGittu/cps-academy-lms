// Everything except the landing page wants the same centred column, so the container lives here
// rather than in the root layout. That leaves the landing page free to run its sections full width.
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>;
}
