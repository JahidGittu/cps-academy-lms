import { CallToAction } from '@/components/home/call-to-action';
import { CourseShowcase } from '@/components/home/course-showcase';
import { Faq } from '@/components/home/faq';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { LatestPosts } from '@/components/home/latest-posts';
import { Teaching } from '@/components/home/teaching';
import { WhyFinish } from '@/components/home/why-finish';

// One file per section. The page is the running order, which is the only thing that changes when
// somebody wants the courses above the blog.
export default function HomePage() {
  return (
    <>
      <Hero />
      <CourseShowcase />
      <HowItWorks />
      <WhyFinish />
      <LatestPosts />
      <Faq />
      <Teaching />
      <CallToAction />
    </>
  );
}
