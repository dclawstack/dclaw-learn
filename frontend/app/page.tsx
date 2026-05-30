import { LandingHero } from './components/landing/HeroSection';
import { FeatureCarousel } from './components/landing/FeatureCarousel';
import { LearningDemo } from './components/landing/LearningDemo';
import { CTAStrip } from './components/landing/CTAStrip';
import { Footer } from './components/landing/Footer';
import { SeedWidget } from './components/SeedWidget';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <LandingHero />
      <FeatureCarousel />
      <LearningDemo />
      <CTAStrip />
      <Footer />
      <SeedWidget />
    </main>
  );
}
