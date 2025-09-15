"use client";

import { ReactNode } from "react";
import { DashboardNav } from "./index";

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  memberSince: string;
  wallet?: string;
}

export default function DashboardLayout({
  children,
  userName,
  memberSince,
  wallet = "₦0",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <DashboardNav
        userName={userName}
        memberSince={memberSince}
        wallet={wallet}
      />
      {children}
    </div>
  );
}
