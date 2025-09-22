"use client";

import {
  ArrowLeft,
  Plus,
  Home,
  Calendar,
  DollarSign,
  MessageCircle,
  Eye,
  Edit,
  Pause,
  ChevronDown,
  Send,
} from "lucide-react";
import { HostNav } from "../components";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";

export default function HostDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "Host",
    ratings: 0,
    bookings: 0,
    avatar: user?.profilePic || "/avatar-placeholder.png",
  };

  // Mock data for listings
  const listings = [
    {
      id: 1,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Completed",
      statusColor: "bg-green-100 text-green-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
    {
      id: 2,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
    {
      id: 3,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Canceled",
      statusColor: "bg-red-100 text-red-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
  ];

  // Mock data for earnings
  const earnings = [
    {
      id: 1,
      title: "Payment for Urban Hub",
      date: "Tue, Jul 1 2025",
      amount: "₦5,000",
      status: "Completed",
      type: "payment",
    },
    {
      id: 2,
      title: "Interest",
      date: "Tue, Jul 1 2025",
      amount: "₦1,000",
      status: "Completed",
      type: "interest",
    },
    {
      id: 3,
      title: "Interest",
      date: "Tue, Jul 1 2025",
      amount: "₦1,000",
      status: "Completed",
      type: "interest",
    },
  ];

  return (
    <RouteGuard allowedRoles={["host"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Navigation Bar */}
        <HostNav
          userName={userInfo.name}
          ratings={userInfo.ratings}
          bookings={userInfo.bookings}
          profilePic={userInfo.avatar}
        />

        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 mb-6">
            <div className="flex items-center gap-3 sm:gap-6">
              <button className="flex items-center justify-center w-6 h-6">
                <ArrowLeft className="w-6 h-6 text-[#121212]" />
              </button>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-[#002F5B]">
                  Welcome {userInfo.name.split(" ")[0]}!
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#686767] tracking-[-0.25px]">
                  Manage your workspace and track your earnings
                </p>
              </div>
            </div>
            <button className="flex items-center justify-center px-4 py-3 bg-[#F25417] text-white rounded-lg gap-2 w-full sm:w-auto">
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-[16px] font-semibold">
                Add Listing
              </span>
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[23px] mb-6">
            <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Home className="w-10 h-10 text-[#002F5B]" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-[18px] font-bold text-[#002F5B] mb-1">
                    My Listings
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#686767]">
                    Manage your listings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-[#002F5B]" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-[18px] font-bold text-[#002F5B] mb-1">
                    Calendar
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#686767]">
                    Manage your bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-10 h-10 text-[#002F5B]" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-[18px] font-bold text-[#002F5B] mb-1">
                    Earnings
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#686767]">
                    View and manage your earnings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-[#002F5B]" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-[18px] font-bold text-[#002F5B] mb-1">
                    Message
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#686767]">
                    Chat with Guest
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[23px]">
            {/* Recent Listings */}
            <div className="flex-1 bg-white border border-[#D1D5DB] rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg sm:text-[24px] font-bold text-[#002F5B]">
                  Recent Listings
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D1D5DB] rounded-lg">
                  <span className="text-sm text-[#121212]">All</span>
                  <ChevronDown className="w-4 h-4 text-[#121212]" />
                </div>
              </div>

              <div className="border-t border-[#D1D5DB] pt-4">
                <div className="space-y-0">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex flex-col justify-center items-start py-3 pb-6 gap-[30px] w-full h-[256px] border-b border-[#D1D5DB] last:border-b-0"
                    >
                      {/* Main content row */}
                      <div className="flex flex-row items-center py-[13px] gap-16 w-full h-[146px]">
                        {/* Image container */}
                        <div className="w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={listing.image}
                            alt={listing.name}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Content section */}
                        <div className="flex flex-col items-start gap-3 w-[198px] h-[77px] flex-shrink-0">
                          {/* Title and details */}
                          <div className="flex flex-col items-start gap-[5px] w-[198px] h-[46px]">
                            <h3 className="w-[198px] h-[22px] font-medium text-[18px] leading-[22px] text-[#002F5B]">
                              {listing.name}
                            </h3>
                            <p className="w-[162px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                              {listing.location}
                            </p>
                            <p className="w-[194px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                              {listing.createdDate}
                            </p>
                          </div>
                        </div>

                        {/* Price and status section */}
                        <div className="flex flex-row justify-center items-center p-[10px] gap-[10px] w-[105px] h-[44px] flex-shrink-0">
                          <p className="w-[85px] h-[24px] font-bold text-[20px] leading-[24px] text-[#002F5B]">
                            {listing.price}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className="flex flex-row items-center px-[9px] py-[7px] gap-[3px] w-fit h-[33px] bg-[#DCFCE7] rounded-full flex-shrink-0">
                          <span className="w-fit h-[19px] font-medium text-[16px] leading-[19px] text-center text-[#166534]">
                            {listing.status}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex flex-row items-center gap-[7px] w-[294px] h-[44px]">
                        {/* View button */}
                        <button className="flex flex-row justify-center items-center px-[10px] py-[13px] gap-[10px] w-[93px] h-[44px] bg-[#DCFCE7] rounded-lg">
                          <Eye className="w-6 h-6 text-[#166534]" />
                          <span className="w-[39px] h-[19px] font-semibold text-[16px] leading-[19px] text-[#166534]">
                            View
                          </span>
                        </button>

                        {/* Edit button */}
                        <button className="flex flex-row justify-center items-center px-[10px] py-[13px] gap-[10px] w-[85px] h-[44px] bg-[#EDF6FF] rounded-lg">
                          <Edit className="w-6 h-6 text-[#002F5B]" />
                          <span className="w-[31px] h-[19px] font-semibold text-[16px] leading-[19px] text-[#002F5B]">
                            Edit
                          </span>
                        </button>

                        {/* Pause button */}
                        <button className="flex flex-row justify-center items-center px-[10px] py-[13px] gap-[10px] w-[102px] h-[44px] bg-[#FEE2E2] rounded-lg">
                          <Pause className="w-6 h-6 text-[#B91C1C]" />
                          <span className="w-[48px] h-[19px] font-semibold text-[16px] leading-[19px] text-[#B91C1C]">
                            Pause
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="w-full lg:w-[506px] bg-white border border-[#D1D5DB] rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-[24px] font-bold text-[#002F5B] mb-4 pb-2 border-b border-[#D1D5DB]">
                Recent Earnings
              </h2>

              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center gap-4 p-4 border-b border-[#D1D5DB] last:border-b-0"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      earning.type === 'payment' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <Send className={`w-6 h-6 ${
                        earning.type === 'payment' ? 'text-red-600' : 'text-green-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm sm:text-[18px] font-medium text-[#002F5B]">
                        {earning.title}
                      </h3>
                      <p className="text-xs sm:text-[14px] text-[#686767]">
                        {earning.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm sm:text-[14px] font-medium ${
                        earning.type === 'payment' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {earning.amount}
                      </p>
                      <p className="text-xs text-green-600">
                        {earning.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
