import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";

export default function PopularSpaces() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-start gap-2 mb-12">
          <h2 className="text-3xl font-bold text-[#002F5B]">
            Popular Spaces in Lagos
          </h2>
          <ArrowRight className="w-6 h-6 text-[#002F5B]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="rounded-lg overflow-hidden">
            <div className="h-64 sm:h-72 md:h-80 bg-gradient-to-br from-blue-100 to-orange-100 relative">
              <Image
                src="/space1.png"
                alt="Workspace"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#002F5B]">
                  Urban Coworking Hub
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm text-[#002F5B]">4.75</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Victoria Island, Lagos
              </p>
              <p className="text-sm font-medium text-gray-600">₦5000/day</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            <div className="h-64 sm:h-72 md:h-80 bg-gradient-to-br from-purple-100 to-pink-100 relative">
              <Image
                src="/space2.png"
                alt="Workspace"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#002F5B]">Digital Space</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm text-[#002F5B]">4.75</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Yaba, Lagos</p>
              <p className="text-sm font-medium text-gray-600">₦10,000/day</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            <div className="h-64 sm:h-72 md:h-80 bg-gradient-to-br from-green-100 to-blue-100 relative">
              <Image
                src="/space3.png"
                alt="Workspace"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#002F5B]">
                  Analyst Coworking Hub
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm text-[#002F5B]">4.75</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Ikeja, Lagos</p>
              <p className="text-sm font-medium text-gray-600">₦5000/day</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
