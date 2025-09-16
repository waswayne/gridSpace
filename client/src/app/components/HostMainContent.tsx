"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import HostListingCard from "./HostListingCard";

export default function HostMainContent() {
  const [listings] = useState([
    {
      id: 1,
      image: "/space1.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "live" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
    {
      id: 2,
      image: "/space2.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "pending" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
    {
      id: 3,
      image: "/space3.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "paused" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
    {
      id: 4,
      image: "/space1.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "live" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
    {
      id: 5,
      image: "/space2.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "pending" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
    {
      id: 6,
      image: "/space3.png",
      name: "Urban Hub",
      location: "Victoria Island, Lagos",
      rating: 4.5,
      bookings: 120,
      price: "₦5000",
      status: "paused" as const,
      createdDate: "Mon, Jul 5, 2024",
      lastBooking: "Fri, Jul 1, 2025",
    },
  ]);

  const handleView = (id: number) => {
    console.log("View listing:", id);
  };

  const handleEdit = (id: number) => {
    console.log("Edit listing:", id);
  };

  const handleToggleStatus = (id: number) => {
    console.log("Toggle status for listing:", id);
  };

  return (
    <div className="flex-1">
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[24px] font-semibold text-[#002F5B]">
          My Listings ({listings.length})
        </h2>

        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[#F25417] text-white rounded-lg w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-[16px] font-semibold">
            Add Listing
          </span>
        </button>
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] gap-4 sm:gap-5">
        {listings.map((listing) => (
          <HostListingCard
            key={listing.id}
            image={listing.image}
            name={listing.name}
            location={listing.location}
            rating={listing.rating}
            bookings={listing.bookings}
            price={listing.price}
            status={listing.status}
            createdDate={listing.createdDate}
            lastBooking={listing.lastBooking}
            onView={() => handleView(listing.id)}
            onEdit={() => handleEdit(listing.id)}
            onToggleStatus={() => handleToggleStatus(listing.id)}
          />
        ))}
      </div>
    </div>
  );
}
