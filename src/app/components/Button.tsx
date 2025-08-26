type ButtonVariant = "primary" | "secondary" | "transparent";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md";
};

function getVariantClasses(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return "bg-[#002F5B] hover:bg-slate-900 text-white";
    case "transparent":
      return "bg-transparent text-slate-900 hover:bg-slate-900 hover:text-white";
    case "primary":
    default:
      return "bg-[#F25417] hover:bg-[#F25417] text-white";
  }
}

function getSizeClasses(size: "sm" | "md") {
  return size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  fullWidth = false,
  size = "md",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed";
  const width = fullWidth ? "w-full" : "";
  const style = `${base} ${getVariantClasses(variant)} ${getSizeClasses(
    size
  )} ${width} ${className}`;

  if (href) {
    return (
      <a href={href} className={style}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={style}>
      {children}
    </button>
  );
}

export default Button;
