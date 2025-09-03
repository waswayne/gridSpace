"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-2 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="GridSpace Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-[#F25417]">GridSpace</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden [@media(min-width:840px)]:flex items-center gap-6 mr-6">
            <a href="#" className="text-sm text-[#121212] hover:text-[#F25417]">
              How it works
            </a>
            <a href="#" className="text-sm text-[#121212] hover:text-[#F25417]">
              Host a Space
            </a>
            <a href="#" className="text-sm text-[#121212] hover:text-[#F25417]">
              About
            </a>
          </div>
          <button className="hidden [@media(min-width:840px)]:inline-block px-3 md:px-4 py-2 text-sm font-bold text-[#121212] hover:bg-gray-100 rounded-lg">
            Become a Host
          </button>
          <button className="hidden [@media(min-width:840px)]:inline-block px-3 md:px-4 py-2 text-sm font-bold text-white bg-[#F25417] hover:bg-[#E04A0F] rounded-lg">
            Sign Up
          </button>
          <button
            className="[@media(min-width:840px)]:hidden inline-flex items-center justify-center p-2 rounded-md text-[#121212] hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Panel */}
      {mobileOpen && (
        <div className="[@media(min-width:840px)]:hidden px-4 pb-3 bg-white shadow-sm">
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="text-sm text-[#121212] hover:text-[#F25417]"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            <a
              href="#"
              className="text-sm text-[#121212] hover:text-[#F25417]"
              onClick={() => setMobileOpen(false)}
            >
              Host a Space
            </a>
            <a
              href="#"
              className="text-sm text-[#121212] hover:text-[#F25417]"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <div className="flex items-center gap-3 pt-1">
              <button
                className="flex-1 px-3 py-2 text-sm font-bold text-[#121212] hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Become a Host
              </button>
              <button
                className="flex-1 px-3 py-2 text-sm font-bold text-white bg-[#F25417] hover:bg-[#E04A0F] rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
