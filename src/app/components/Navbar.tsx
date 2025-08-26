"use client";

import React from "react";
import Button from "./Button";
import { Menu, X } from "lucide-react";

function useToggle(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  const close = React.useCallback(() => setOpen(false), []);
  return { open, toggle, close } as const;
}

export default function Navbar() {
  const { open, toggle, close } = useToggle(false);
  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-[55px] w-[55px]">
              <img
                src="/c8698afd5793db87ff195789fb2f01f86d414ba3.png"
                className="h-full w=full"
                alt="Logo"
              />
            </div>
            <span className="font-semibold text-[29px] text-[#F25417]">
              GridSpace
            </span>
          </div>
          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-900 text-[14px]">
              How it works
            </a>
            <a href="#host" className="hover:text-slate-900 text-[14px]">
              Host a Space
            </a>
            <a href="#about" className="hover:text-slate-900 text-[14px]">
              About
            </a>
            <div className="ml-4 flex items-center gap-2">
              <Button
                variant="transparent"
                href="#become-host"
                size="sm"
                className="font-bold"
              >
                Become a Host
              </Button>
              <Button href="#signup" size="sm" className="font-bold">
                Sign Up
              </Button>
            </div>
          </nav>
          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle navigation"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={toggle}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-3 space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:hidden">
            <a
              onClick={close}
              href="#how"
              className="block text-sm text-slate-700 hover:text-slate-900"
            >
              How it works
            </a>
            <a
              onClick={close}
              href="#host"
              className="block text-sm text-slate-700 hover:text-slate-900"
            >
              Host a Space
            </a>
            <a
              onClick={close}
              href="#about"
              className="block text-sm text-slate-700 hover:text-slate-900"
            >
              About
            </a>
            <div className="flex gap-2 pt-2">
              <Button
                href="#become-host"
                variant="transparent"
                size="sm"
                fullWidth
              >
                Become a Host
              </Button>
              <Button href="#signup" size="sm" fullWidth>
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
