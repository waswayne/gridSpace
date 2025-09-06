import Image from "next/image";
import React from "react";
import { DollarSign, ShieldCheck, Users } from "lucide-react";
import { Button } from "./index";

type Props = {
  // Replace `heroSrc` with a path to your image inside /public (e.g. "/hosting-hero.jpg")
  heroSrc?: string;
};

export default function HostingWorkspace({ heroSrc = "/hosting.png" }: Props) {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Left content */}
        <div className="flex flex-col items-start gap-[23px] md:gap-[42px] w-full">
          {/* Header Section */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] text-[#002F5B] w-full">
              Earn Money Hosting Workspaces
            </h2>
            <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[19px] md:leading-[28px] text-[#121212] w-full text-left">
              Transform your unused office space into a revenue stream. Join
              thousands of hosts earning money by sharing their workspaces with
              professionals.
            </p>
          </div>

          {/* Features Section */}
          <div className="flex flex-col items-start gap-[16px] md:gap-[32px] w-full max-w-[377px] md:max-w-[524px]">
            {/* Feature 1 */}
            <div className="flex flex-row items-center gap-[11px] w-full">
              <div className="flex justify-center items-center w-[40px] h-[40px] max-sm:min-h-[40px] max-sm:min-w-[40px] md:w-[52px] md:h-[52px] bg-[#DCFCE7] rounded-full">
                <DollarSign className="w-[28px] h-[28px] text-[#166534]" />
              </div>
              <div className="flex flex-col items-start max-w-[326px]">
                <h3 className="font-inter font-bold text-[16px] md:text-[24px] leading-[19px] md:leading-[29px] text-[#121212]">
                  Flexible Earnings
                </h3>
                <p className="font-inter font-normal text-[14px] md:text-[20px] leading-[17px] md:leading-[28px] text-[#121212]">
                  Set your own prices and availability. Earn extra income on your schedule
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-row items-center gap-[11px] w-full">
              <div className="flex justify-center items-center w-[40px] h-[40px] max-sm:min-h-[40px] max-sm:min-w-[40px] md:w-[52px] md:h-[52px] bg-[#EDF6FF] rounded-full">
                <ShieldCheck className="w-[28px] h-[28px] text-[#002F5B]" />
              </div>
              <div className="flex flex-col items-start max-w-[326px]">
                <h3 className="font-inter font-bold text-[16px] md:text-[24px] leading-[19px] md:leading-[29px] text-[#121212]">
                  Secure Platform
                </h3>
                <p className="font-inter font-normal text-[14px] md:text-[20px] leading-[17px] md:leading-[28px] text-[#121212]">
                  Verified users and secure payments.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-row items-center gap-[11px] w-full">
              <div className="flex justify-center items-center w-[40px] h-[40px] max-sm:min-h-[40px] max-sm:min-w-[40px] md:w-[52px] md:h-[52px] bg-[#FAF5FF] rounded-full">
                <Users className="w-[28px] h-[28px] text-[#A855F7]" />
              </div>
              <div className="flex flex-col items-start max-w-[326px]">
                <h3 className="font-inter font-bold text-[16px] md:text-[24px] leading-[19px] md:leading-[29px] text-[#121212]">
                  Build Community
                </h3>
                <p className="font-inter font-normal text-[14px] md:text-[20px] leading-[17px] md:leading-[28px] text-[#121212]">
                  Connect with entrepreneurs and professionals in your area.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            variant="primary"
            size="lg"
            className=""
          >
            Start Hosting Today
          </Button>
        </div>

        {/* Right image */}
        <div className="w-full h-[319px] md:h-[501px] rounded-[8px] overflow-hidden mt-4 md:mt-0">
          <Image
            src={heroSrc}
            alt="Workspace host welcoming guest"
            width={621}
            height={501}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
