import { Lightbulb, Shield, Wallet, BookOpen } from "lucide-react";

export default function WhyChoose() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002F5B] mb-4">
            Why Choose GridSpace
          </h2>
          <p className="text-base md:text-xl text-[#121212]">
            Experience the difference with our commitment to quality and
            reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-[#D4FCE0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-12 h-12 text-[#5FC17F]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#121212] font-700">
              Reliable Power & Internet
            </h3>
            <p className="text-[#121212]">
              Never worry about connectivity with guaranteed backup power and
              high-speed internet at every location.
            </p>
          </div>

          <div className="bg-[#002F5B] p-10 rounded-lg shadow-sm text-center text-white">
            <div className="w-16 h-16 bg-[#F25417] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white font-700">
              Verified & Secure
            </h3>
            <p className="text-white">
              Every workspace is thoroughly vetted and verified to ensure
              quality, safety, and professionalism.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-[#FAF5FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-[#A855F7]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#121212] font-700">
              Affordable Rates
            </h3>
            <p className="text-[#121212]">
              Get access to quality workspaces that suit your budget, whether
              you&apos;re booking for a day or a month
            </p>
          </div>

          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-[#D7F7FB] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-[#2563EB]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#121212] font-700">
              Flexible Booking
            </h3>
            <p className="text-[#121212]">
              Book by the hour, day, or month with easy cancellation and
              modification options.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
