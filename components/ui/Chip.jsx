"use client";

const VARIANTS = {
  filter:   "border border-(--zova-border) bg-white text-(--zova-text-body) data-[active=true]:border-(--zova-primary-action) data-[active=true]:bg-(--zova-green-soft) data-[active=true]:text-(--zova-primary-action)",
  category: "border border-(--zova-border) bg-white text-(--zova-text-body) data-[active=true]:border-(--zova-primary-action) data-[active=true]:bg-(--zova-green-soft) data-[active=true]:text-(--zova-primary-action)",
  size:     "border border-gray-200 bg-white text-gray-700 data-[active=true]:border-(--zova-primary-action) data-[active=true]:bg-(--zova-green-soft) data-[active=true]:text-(--zova-primary-action)",
};

export default function Chip({
  variant = "filter",
  active = false,
  onClick,
  className = "",
  children,
}) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        VARIANTS[variant] ?? VARIANTS.filter,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
