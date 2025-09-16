"use client";

import { HostNav, HostSidebar, HostMainContent } from "../components";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";

export default function HostDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "Host",
    ratings: 0, // This should come from an API or state
    bookings: 0, // This should come from an API or state
    avatar: user?.profilePic || "/avatar-placeholder.png",
  };

  return (
    <RouteGuard allowedRoles={["host"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Host Navigation */}
        <div className="pt-4">
          <HostNav
            userName={userInfo.name}
            ratings={userInfo.ratings}
            bookings={userInfo.bookings}
          />
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-8 pb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Sidebar */}
            <div className="w-full bg-white lg:w-auto">
              <HostSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <HostMainContent />
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
