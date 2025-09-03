"use client";

import {
  Navigation,
  HeroSection,
  HowItWorks,
  WhyChoose,
  PopularSpaces,
  Testimonials,
  CallToAction,
  Newsletter,
  Footer,
} from "./components";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <Navigation />
      <HeroSection />
      <HowItWorks />
      <WhyChoose />
      <PopularSpaces />
      <Testimonials />
      <CallToAction />
      <Newsletter />
      <Footer />
    </div>
  );
}
