import { HeroSection } from '@/components/landing-components/hero-section';
import { Features } from '@/components/landing-components/features-section';
import { Features2 } from '@/components/landing-components/features-2-section';
import { VideoGallery } from '@/components/landing-components/video-gallery';
import { CallToAction } from '@/components/landing-components/call-to-action';

export const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen min-w-full flex flex-col justify-start items-center">
      <HeroSection />
      <Features />
      <Features2 />
      <VideoGallery />
      <CallToAction />
    </div>
  );
};
