import React from "react";
import Button from "./Button";
import type { ButtonProps } from "./Button";

export type CardProps = {
  icon?: React.ReactNode;
  title: string;
  cta?: {
    label: string;
    href?: string;
    variant?: ButtonProps["variant"];
  };
  className?: string;
};

export default function Card({ icon, title, cta, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[12px] border border-slate-200 bg-white p-6 shadow-sm`}
    >
      <div
        className={`mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-md ${className}`}
      >
        {icon}
      </div>
      <div className="flex flex-col justify-center gap-[5px]">
        <h3 className="mb-2 text-center text-[24px] font-semibold text-[#002F5B]">
          {title}
        </h3>
        {cta && (
          <div className="mt-2 flex justify-center">
            <Button
              href={cta.href}
              variant={cta.variant ?? "secondary"}
              size="sm"
              className="min-w-40 w-full"
            >
              {cta.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
