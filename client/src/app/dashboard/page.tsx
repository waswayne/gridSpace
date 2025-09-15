"use client";

import { Search, Calendar, Wallet, MessageCircle } from "lucide-react";
import { DashboardLayout, DashboardCard, WorkspaceCard } from "../components";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "User",
    memberSince: new Date(user?.createdAt || Date.now()).getFullYear().toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
    wallet: "₦0", // This could be updated based on your wallet implementation
  };

  return (
    <RouteGuard allowedRoles={["user"]}>
      <DashboardLayout
        userName={userInfo.name}
        memberSince={userInfo.memberSince}
        wallet={userInfo.wallet}
      >
        {/* Welcome Section */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-[101px] pt-8 sm:pt-12 md:pt-16 lg:pt-[97px] pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-[#002F5B]">
              Welcome {userInfo.name.split(" ")[0]}!
            </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#686767]">
            Discover your next workspace or manage existing bookings
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-[101px] pt-8 sm:pt-12 md:pt-16 lg:pt-[183px] pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-[23px]">
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
      <div className="px-4 sm:px-6 md:px-8 lg:px-[100px] pb-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-[23px]">
          {/* Recent Activity */}
          <div className="w-full lg:w-[715px] h-auto lg:h-[412px] bg-white border border-[#D1D5DB] rounded-lg">
            <div className="p-4 sm:p-5">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-bold text-[#002F5B] mb-4">
                Recent Activity
              </h2>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[350px] lg:h-[calc(100%-80px)] gap-2 px-4">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-[60px] lg:h-[60px] text-[#C3C4C5]" />
              <p className="text-sm sm:text-base lg:text-[16px] font-medium text-[#6F6F6F] text-center">
                No activity yet
              </p>
              <button className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-[10px] bg-[#F25417] text-white rounded-lg mt-2">
                <span className="text-sm sm:text-base lg:text-[18px] font-semibold">
                  Book your first Space
                </span>
              </button>
            </div>
          </div>

          {/* Recommended Spaces */}
          <div className="w-full lg:w-[506px] h-auto lg:h-[412px] bg-white border border-[#D1D5DB] rounded-lg p-4 sm:p-5 lg:p-[21px]">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-bold text-[#002F5B] mb-3">
              Recommended Space
            </h2>

            <WorkspaceCard
              image="/space1.png"
              name="Urban Coworking Hub"
              location="Victoria Island, Lagos"
              rating={4.75}
              price="₦5000"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
    </RouteGuard>
  );
}
