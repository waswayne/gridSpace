"use client";

import { AdminNav, AdminSidebar, AdminMainContent } from "../components";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";

export default function AdminDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "Admin",
    adminSince: new Date(user?.createdAt || Date.now()).getFullYear().toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
  };

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Navigation */}
        <AdminNav userName={userInfo.name} adminSince={userInfo.adminSince} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 sm:px-6 md:px-8 lg:px-[101px] pt-8 sm:pt-12 md:pt-16 lg:pt-[111px]">
          <div className="w-full lg:w-auto">
            <AdminSidebar />
          </div>
          <div className="flex-1">
            <AdminMainContent />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
