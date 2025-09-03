import { ArrowRight, Users, MapPin, Medal } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-10 md:py-16 gap-8 max-w-[1440px] mx-auto">
      <div className="w-full md:w-1/2">
        <div className="mb-16">
          <h1 className="max-sm:text-[32px] text-5xl font-bold text-[#002F5B] mb-6 md:mb-8 leading-tight">
            Find a <span className="text-[#F25417]">flexible workspace</span>{" "}
            near you
          </h1>
          <p className="text-base md:text-xl text-[#121212] leading-relaxed">
            Discover verified, flexible workspaces with reliable power,
            high-speed internet, and everything you need to stay productive on
            the go.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 w-full">
          <div className="flex flex-col [@media(min-width:1440px)]:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-2 w-full">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#002F5B] rounded-lg w-full sm:w-1/2">
                <MapPin className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter location or city"
                  className="w-full text-sm text-gray-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-[#002F5B] rounded-lg w-full sm:w-1/2">
                <div className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="dd/mm/yy"
                  className="w-full text-sm text-gray-500 outline-none"
                />
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F25417] text-white font-bold rounded-lg hover:bg-[#E04A0F] w-full [@media(min-width:1440px)]:w-fit whitespace-nowrap">
              Find a Space
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 max-sm:size-10 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <Users className="max-sm:size-[50%] w-8 h-8 text-[#F25417]" />
            </div>
            <div>
              <div className=" max-sm:text-lg text-3xl font-bold text-[#002F5B]">
                50K+
              </div>
              <div className="max-sm:text-xs text-sm text-gray-500">Active Users</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 max-sm:size-10 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <MapPin className="max-sm:size-[50%] w-8 h-8 text-[#F25417]" />
            </div>
            <div>
              <div className=" max-sm:text-lg text-3xl font-bold text-[#002F5B]">
                1200+
              </div>
              <div className="max-sm:text-xs text-sm text-gray-500">Locations</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 max-sm:size-10 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <Medal className="max-sm:size-[50%] w-8 h-8 text-[#F25417]" />
            </div>
            <div>
              <div className=" max-sm:text-lg text-3xl font-bold text-[#002F5B]">
                4.9/5
              </div>
              <div className="max-sm:text-xs text-sm text-gray-500">Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 relative mt-6 md:mt-0">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#D6EBFF] absolute -left-3 -bottom-6"></div>
        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#FFE2D6] absolute -right-3 -top-6"></div>
        <div className="w-full h-64 sm:h-80 md:h-[600px] bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg shadow-sm relative overflow-hidden">
          <Image
            src="/hero.png"
            alt="Workspace"
            width={1000}
            height={1000}
            quality={100}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
