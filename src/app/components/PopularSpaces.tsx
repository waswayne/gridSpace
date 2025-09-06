import {Star } from "lucide-react";
import Image from "next/image";
import { Button } from "./index";

export default function PopularSpaces() {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
      <div className="flex flex-col items-center gap-[20px]">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-[8px] w-full max-w-[613px] px-4 md:px-0">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[#002F5B] text-center">
            Featured Workspaces
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[#121212] text-center">
            Discover the most popular coworking spaces trusted by thousands of professionals
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-[27px] w-full">
          {/* First Space */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <div className="relative w-full h-[250px] md:h-[302px] rounded-[8px] overflow-hidden">
              <Image
                src="/space1.png"
                alt="Urban Coworking Hub"
                width={800}
                height={800}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex flex-col justify-center gap-[4px]">
                <div className="flex flex-row items-start justify-between w-full">
                  <h3 className="font-inter font-semibold text-[16px] md:text-[18px] leading-[20px] md:leading-[22px] text-[#002F5B]">
                    Urban Coworking Hub
                  </h3>
                  <div className="flex flex-row items-center gap-1">
                    <Star className="w-5 md:w-6 h-5 md:h-6 text-[#FFC849] fill-current" />
                    <span className="font-inter font-normal text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#121212] tracking-[-0.25px]">4.75</span>
                  </div>
                </div>
                <p className="font-inter font-medium text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#686767]">
                  Victoria Island, Lagos
                </p>
              </div>
              <p className="font-inter font-semibold text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[#002F5B]">
                ₦5000/day
              </p>
            </div>
          </div>

          {/* Second Space */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <div className="relative w-full h-[250px] md:h-[302px] rounded-[8px] overflow-hidden">
              <Image
                src="/space2.png"
                alt="Digital Space"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex flex-col justify-center gap-[4px]">
                <div className="flex flex-row items-start justify-between w-full">
                  <h3 className="font-inter font-semibold text-[16px] md:text-[18px] leading-[20px] md:leading-[22px] text-[#002F5B]">
                    Digital Space
                  </h3>
                  <div className="flex flex-row items-center gap-1">
                    <Star className="w-5 md:w-6 h-5 md:h-6 text-[#FFC849] fill-current" />
                    <span className="font-inter font-normal text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#121212] tracking-[-0.25px]">4.75</span>
                  </div>
                </div>
                <p className="font-inter font-medium text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#686767]">
                  Yaba, Lagos
                </p>
              </div>
              <p className="font-inter font-semibold text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[#002F5B]">
                ₦10,000/day
              </p>
            </div>
          </div>

          {/* Third Space */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <div className="relative w-full h-[250px] md:h-[302px] rounded-[8px] overflow-hidden">
              <Image
                src="/space3.png"
                alt="Urban Coworking Hub"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-[10px] w-full">
              <div className="flex flex-col justify-center gap-[4px]">
                <div className="flex flex-row items-start justify-between w-full">
                  <h3 className="font-inter font-semibold text-[16px] md:text-[18px] leading-[20px] md:leading-[22px] text-[#002F5B]">
                    Analyst Coworking Hub
                  </h3>
                  <div className="flex flex-row items-center gap-1">
                    <Star className="w-5 md:w-6 h-5 md:h-6 text-[#FFC849] fill-current" />
                    <span className="font-inter font-normal text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#121212] tracking-[-0.25px]">4.75</span>
                  </div>
                </div>
                <p className="font-inter font-medium text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[#686767]">
                  Ikeja, Lagos
                </p>
              </div>
              <p className="font-inter font-semibold text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[#002F5B]">
                ₦5000/day
              </p>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <Button 
          variant="primary"
          size="lg"
          className=""
        >
          View All Spaces
        </Button>
      </div>
    </section>
  );
}
