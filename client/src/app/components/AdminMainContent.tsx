"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AdminListingRow from "./AdminListingRow";

export default function AdminMainContent() {
  const [listings] = useState([
    {
      id: 1,
      image: "/space1.png",
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      hostName: "Deba Derek",
      hostEmail: "derek45@gmail.com",
      submittedDate: "July 2nd, 2025",
      status: "pending" as const,
    },
    {
      id: 2,
      image: "/space2.png",
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      hostName: "Deba Derek",
      hostEmail: "derek45@gmail.com",
      submittedDate: "July 2nd, 2025",
      status: "approved" as const,
    },
    {
      id: 3,
      image: "/space3.png",
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      hostName: "Deba Derek",
      hostEmail: "derek45@gmail.com",
      submittedDate: "July 2nd, 2025",
      status: "rejected" as const,
    },
  ]);

  const handleView = (id: number) => {
    console.log("View listing:", id);
  };

  const handleApprove = (id: number) => {
    console.log("Approve listing:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject listing:", id);
  };

  return (
    <div className="flex-1">
      {/* Header with title and filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-semibold text-[#002F5B]">
          Listing Management
        </h2>

        <div className="flex items-center px-3 py-3 gap-2 sm:gap-[162px] w-full sm:w-[290px] h-[50px] bg-white border border-[#D8D8D9] rounded-lg">
          <span className="text-sm sm:text-[16px] text-[#121212]">
            All Statuses
          </span>
          <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-[#121212] ml-auto" />
        </div>
      </div>

      {/* Listings Table */}
      <div className="w-full lg:w-[926px] h-auto lg:h-[425px] bg-white shadow-sm rounded-lg overflow-x-auto">
        {/* Table Header */}
        <div className="px-2 sm:px-4 py-4 sm:py-6 border-b border-[#D8D8D9]">
          <div className="flex items-center gap-4 sm:gap-8 md:gap-16 lg:gap-[241px] w-full min-w-[600px] h-[22px]">
            <span className="text-sm sm:text-base lg:text-[18px] font-semibold text-[#002F5B] w-[100px] sm:w-[119px]">
              Space Details
            </span>
            <span className="text-sm sm:text-base lg:text-[18px] font-semibold text-[#002F5B] w-[60px] sm:w-[42px]">
              Host
            </span>
            <span className="text-sm sm:text-base lg:text-[18px] font-semibold text-[#002F5B] w-[80px] sm:w-[91px]">
              Submitted
            </span>
            <span className="text-sm sm:text-base lg:text-[18px] font-semibold text-[#002F5B] w-[60px] sm:w-[57px]">
              Status
            </span>
            <span className="text-sm sm:text-base lg:text-[18px] font-semibold text-[#002F5B] w-[60px] sm:w-[57px]">
              Action
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {listings.map((listing, index) => (
            <div key={listing.id}>
              <AdminListingRow
                image={listing.image}
                name={listing.name}
                location={listing.location}
                hostName={listing.hostName}
                hostEmail={listing.hostEmail}
                submittedDate={listing.submittedDate}
                status={listing.status}
                onView={() => handleView(listing.id)}
                onApprove={() => handleApprove(listing.id)}
                onReject={() => handleReject(listing.id)}
              />
              {index < listings.length - 1 && (
                <div className="w-full h-[0.5px] bg-[#D8D8D9]"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
