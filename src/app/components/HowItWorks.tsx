import { Search, CheckCircle, Zap } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="bg-[#F9F3F1] py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002F5B] mb-4">
            How GridSpace Works
          </h2>
          <p className="text-base md:text-xl text-[#121212]">
            Get access to productive workspaces in just three simple steps
          </p>
        </div>

        <div className="flex flex-col max-md:items-center max-md:gap-14 md:flex-row gap-6 md:gap-8 justify-between">
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-sm w-full relative h-[320px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#002F5B] rounded-full flex items-center justify-center mx-auto mb-4 absolute top-[-12%] left-1/2 -translate-x-1/2">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#121212] font-700 text-center mb-4">
              Search & Discover
            </h3>
            <p className="text-center text-[#121212]">
              Browse verified workspaces in your area with detailed photos,
              amenities and real time availability
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-sm w-full relative h-[320px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#F25417] rounded-full flex items-center justify-center mx-auto mb-4 absolute top-[-12%] left-1/2 -translate-x-1/2">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#121212] font-700 text-center mb-4">
              Book Instantly
            </h3>
            <p className="text-center text-[#121212]">
              Reserve your perfect workspace instantly with secure payment and
              flexible booking options
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-sm w-full relative h-[320px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#002F5B] rounded-full flex items-center justify-center mx-auto mb-4 absolute top-[-12%] left-1/2 -translate-x-1/2">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#121212] font-700 text-center mb-4">
              Work Productively
            </h3>
            <p className="text-center text-[#121212]">
              Arrive and get productive immediately with reliable power, fast
              WiFi and all essential amenities
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
