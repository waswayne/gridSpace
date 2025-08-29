import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "px-6 py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
