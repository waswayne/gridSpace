import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import WhyChooseSection from "@/app/components/WhyChooseSection";
import PopularSpacesSection from "@/app/components/PopularSpacesSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import CTASection from "@/app/components/CTASection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <PopularSpacesSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
