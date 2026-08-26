import { Features } from '@/components/home/features';
import { Hero } from '@/components/home/hero';
import { Roles } from '@/components/home/roles';
import { Steps } from '@/components/home/steps';

// One file per section. The page is the running order, which is the only thing that changes when
// somebody wants the roles above the features.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Roles />
      <Steps />
    </>
  );
}
