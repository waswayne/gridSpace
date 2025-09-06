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
  FeaturedSpaces,
  HostingWorkspace,
} from "./components";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <Navigation />
      <HeroSection />
      <PopularSpaces />
      <HowItWorks />
      <WhyChoose />
      <FeaturedSpaces />
      <HostingWorkspace />
      <Testimonials />
      <CallToAction />
      <Newsletter />
      <Footer />
    </div>
  );
}
