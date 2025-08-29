"use client";

import Button from "./Button";
import { Grid3X3 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Grid3X3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GridSpace</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Host a Space
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              About
            </a>

            <Button variant="secondary" className="hidden sm:block">
              Become a Host
            </Button>
            <Button variant="primary">Sign Up</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
