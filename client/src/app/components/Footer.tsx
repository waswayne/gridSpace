import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import { Button } from "./index";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] py-5">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-lg:gap-4 mb-8">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="GridSpace Logo"
                width={48}
                height={48}
              />
              <span className="text-[28px] font-bold text-[var(--color-primary)]">
                GridSpace
              </span>
            </div>
            <p className="text-[16px] mb-4">
              Connecting professionals with flexible, verified workspaces across
              Nigeria.
            </p>
            <div className="flex gap-4">
              <FaFacebook
                size={24}
                className="cursor-pointer hover:text-[var(--color-primary)]"
              />
              <FaInstagram
                size={24}
                className="cursor-pointer hover:text-[var(--color-primary)]"
              />
              <FaXTwitter
                size={24}
                className="cursor-pointer hover:text-[var(--color-primary)]"
              />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[16px] lg:text-[20px] mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-[14px] lg:text-[16px]">
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Host your space
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[16px] lg:text-[20px] mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-[14px] lg:text-[16px]">
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-primary)]">
                  Safety
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[16px] lg:text-[20px] mb-4">
              Partners & Opportunities
            </h3>
            <p className="text-[14px] lg:text-[16px] mb-4">
              Want to invest or collaborate? We&apos;re open to opportunities
            </p>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              Contact Us
              <Mail className="w-5 h-5" />
            </Button>
          </div>

          <div>
            <h3 className="font-bold text-[16px] lg:text-[20px] mb-4">
              Contact
            </h3>
            <div className="space-y-3 text-[14px] lg:text-[16px]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>hello@gridspace.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>09046575527</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
            <p className="font-bold text-center md:text-left">
              Copyright © 2025, GridSpace. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-[var(--color-primary)]">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[var(--color-primary)]">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
