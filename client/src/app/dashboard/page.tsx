"use client";

import {
  Search,
  Calendar,
  Wallet,
  MessageCircle,
  Filter,
  Bell,
} from "lucide-react";
import { DashboardLayout, DashboardCard, WorkspaceCard } from "../components";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "User",
    memberSince: new Date(user?.createdAt || Date.now())
      .getFullYear()
      .toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
    wallet: "₦0", // This could be updated based on your wallet implementation
  };

  return (
    <RouteGuard allowedRoles={["user"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Navigation Bar */}
        <div className="bg-white border-b py-4 w-full border-[#D1D5DB]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">
            <div className="flex items-center justify-between h-[70px] gap-[68px]">
              {/* Logo Section */}
              <div className="flex items-center gap-[318px]">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="GridSpace Logo"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                  <span className="text-[#F25417] font-bold text-[28px] leading-[34px]">
                    GridSpace
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center px-[10px] py-[13px] gap-[348px] bg-white border border-[#D1D5DB] rounded-lg w-[466px] h-[44px]">
                <div className="flex items-center gap-[3px]">
                  <Search className="w-6 h-6 text-[#A8A7A7]" />
                  <span className="text-[12px] text-[#A8A7A7]">search...</span>
                </div>
                <Filter className="w-6 h-6 text-[#A8A7A7]" />
              </div>

              {/* User Profile Section */}
              <div className="flex items-center gap-3">
                <div className="w-[49px] h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center">
                  <Bell className="w-7 h-7 text-[#121212]" />
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[70px] h-[70px] bg-gray-200 rounded-full"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                      {userInfo.name.split(" ")[0]}
                    </span>
                    <span className="text-[12px] text-[#686767] leading-[15px]">
                      Member since {userInfo.memberSince}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-bold text-[#002F5B] leading-[39px]">
              Welcome {userInfo.name.split(" ")[0]}!
            </h1>
            <p className="text-[18px] text-[#686767] leading-[22px] tracking-[-0.25px]">
              Discover your next workspace or manage existing bookings
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
          <div className="flex gap-[23px]">
            <DashboardCard
              icon={Search}
              title="Find Workspace"
              description="Search for available workspace"
            />
            <DashboardCard
              icon={Calendar}
              title="My Bookings"
              description="View Upcoming Bookings"
            />
            <DashboardCard
              icon={Wallet}
              title="Wallet"
              description={userInfo.wallet}
            />
            <DashboardCard
              icon={MessageCircle}
              title="Message"
              description="Chat with host"
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
          <div className="flex gap-[23px]">
            {/* Recent Activity */}
            <div className="w-[715px] h-[412px] bg-white border border-[#D1D5DB] rounded-lg relative">
              <div className="absolute top-6 left-5">
                <h2 className="text-[24px] font-bold text-[#002F5B] leading-[29px]">
                  Recent Activity
                </h2>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Calendar className="w-[60px] h-[60px] text-[#C3C4C5]" />
                <p className="text-[16px] font-medium text-[#6F6F6F] text-center">
                  No activity yet
                </p>
                <button className="flex items-center justify-center px-6 py-[10px] bg-[#F25417] text-white rounded-lg mt-2 w-[235px] h-[45px]">
                  <span className="text-[18px] font-semibold">
                    Book your first Space
                  </span>
                </button>
              </div>
            </div>

            {/* Recommended Spaces */}
            <div className="w-[506px] h-[412px] bg-white border border-[#D1D5DB] rounded-lg p-[21px]">
              <h2 className="text-[24px] font-bold text-[#002F5B] leading-[29px] mb-3">
                Recommended Space
              </h2>

              <WorkspaceCard
                image="/space1.png"
                name="Urban Coworking Hub"
                location="Victoria Island, Lagos"
                rating={4.75}
                price="₦5000/day"
              />
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
