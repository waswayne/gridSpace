"use client";

import Image from "next/image";
import { Search, Calendar, Filter } from "lucide-react";

interface DashboardNavProps {
  userName: string;
  memberSince: string;
  wallet?: string;
}

export default function DashboardNav({
  userName,
  memberSince,
  wallet = "₦0",
}: DashboardNavProps) {
  return (
    <nav className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-8 lg:px-[109px] py-4 lg:py-[6px] bg-white gap-4 lg:gap-0">
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-[318px] w-full lg:w-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="GridSpace Logo" width={48} height={48} />
          <span className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#F25417]">
            GridSpace
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center px-3 sm:px-[10px] py-2 sm:py-[13px] gap-2 sm:gap-[348px] w-full sm:w-[300px] md:w-[400px] lg:w-[466px] h-10 sm:h-[44px] border border-[#002F5B] rounded-lg">
          <div className="flex items-center gap-1 sm:gap-[3px]">
            <Search className="w-4 h-4 sm:w-6 sm:h-6 text-[#A8A7A7]" />
            <span className="text-xs sm:text-[12px] text-[#A8A7A7]">
              search...
            </span>
          </div>
          <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-[#121212] ml-auto" />
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-2 sm:gap-[12px] w-full lg:w-[247px] h-auto lg:h-[70px] justify-center lg:justify-start">
        <div className="w-8 h-8 sm:w-[49px] sm:h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center">
          <Calendar className="w-4 h-4 sm:w-7 sm:h-7 text-[#121212]" />
        </div>
        <div className="flex items-center gap-1 sm:gap-[6px]">
          <div className="w-10 h-10 sm:w-[70px] sm:h-[70px] bg-gray-300 rounded-full"></div>
          <div className="flex flex-col gap-1">
            <span className="text-sm sm:text-[16px] font-semibold text-[#002F5B]">
              {userName}
            </span>
            <span className="text-xs sm:text-[12px] text-[#686767]">
              Member since {memberSince}
            </span>
            <span className="text-xs sm:text-[12px] text-[#F25417] font-medium">
              Wallet: {wallet}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
