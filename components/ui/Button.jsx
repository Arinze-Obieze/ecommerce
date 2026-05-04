"use client";

const VARIANTS = {
  primary:   "bg-(--zova-primary-action) hover:bg-(--zova-primary-action-hover) text-white shadow-sm",
  secondary: "bg-white border border-(--zova-border) text-(--zova-text-strong) hover:bg-(--zova-surface-alt)",
  outline:   "bg-transparent border border-(--zova-primary-action) text-(--zova-primary-action) hover:bg-(--zova-green-soft)",
  ghost:     "bg-transparent text-(--zova-primary-action) hover:bg-(--zova-green-soft)",
  danger:    "bg-transparent border border-red-200 text-red-600 hover:bg-red-50",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
