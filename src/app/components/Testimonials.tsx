import { Quote, Star } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="bg-[#FFC3AC] py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002F5B] mb-4">
            What Our Users Say
          </h2>
          <p className="text-base md:text-xl text-[#121212]">
            Join thousands of professionals who trust Gridspace for their
            workspace needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-[#F25417]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src="/ttmn1.png"
                  alt="Workspace"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">John Morgan</h4>
                <p className="text-sm">Marketing Consultant</p>
              </div>
            </div>
            <p className="text-[#2E2E2E] mb-4">
              Gridspace saved my business trip! Found a perfect workspace with
              reliable internet in minutes. The booking process was seamless.
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#F25417] fill-current" />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-[#F25417]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src="/ttmn2.png"
                  alt="Workspace"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">Jessica Wright</h4>
                <p className="text-sm">Freelancer Developer</p>
              </div>
            </div>
            <p className="text-[#2E2E2E] mb-4">
              As a freelancer, I need flexible workspaces. Gridspace&apos;s
              variety and quality are unmatched. Plus, the rates are very
              reasonable
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#F25417] fill-current" />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#FFEBE3] rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-[#F25417]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <Image
                  src="/ttmn3.png"
                  alt="Workspace"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">Derek Woods</h4>
                <p className="text-sm">Product Manager</p>
              </div>
            </div>
            <p className="text-[#2E2E2E] mb-4">
              The verification process gives me confidence. Every space
              I&apos;ve booked has been exactly as described. Excellent platform
            </p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#F25417] fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
