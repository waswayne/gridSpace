"use client";

import Image from "next/image";
import { Search, Filter, ArrowLeft } from "lucide-react";

interface AdminNavProps {
  userName: string;
  adminSince: string;
}

export default function AdminNav({ userName, adminSince }: AdminNavProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 sm:px-6 py-4 gap-4 lg:gap-0">
        {/* Left section with back button and title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button className="flex items-center justify-center w-6 h-6">
            <ArrowLeft className="w-6 h-6 text-[#121212]" />
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-semibold text-[#002F5B]">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#686767]">
              Manage your bookings listings
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center px-3 sm:px-[10px] py-2 sm:py-[13px] gap-2 sm:gap-[348px] w-full sm:w-[300px] md:w-[400px] lg:w-[466px] h-10 sm:h-[44px] border border-[#002F5B] rounded-lg">
          <div className="flex items-center gap-1 sm:gap-[3px]">
            <Search className="w-4 h-4 sm:w-6 sm:h-6 text-[#A8A7A7]" />
            <span className="text-xs sm:text-[12px] text-[#A8A7A7]">
              search...
            </span>
          </div>
          <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-[#121212] ml-auto" />
        </div>

        {/* User profile section */}
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
          <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] border-2 border-[#121212] rounded-full"></div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-10 h-10 sm:w-[70px] sm:h-[70px] bg-gray-300 rounded-full"></div>
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <span className="text-sm sm:text-[16px] font-semibold text-[#002F5B]">
                  {userName}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#F25417] rounded-full">
                  <span className="text-xs sm:text-[14px] text-white">
                    Admin
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-[12px] text-[#686767]">
                Admin since {adminSince}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
