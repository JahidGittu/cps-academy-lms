import { CallToAction } from '@/components/home/call-to-action';
import { CourseShowcase } from '@/components/home/course-showcase';
import { Faq } from '@/components/home/faq';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { LatestPosts } from '@/components/home/latest-posts';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CourseShowcase />
      <HowItWorks />
      <LatestPosts />
      <Faq />
      <CallToAction />
    </>
  );
}
