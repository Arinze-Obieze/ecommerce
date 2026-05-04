const VARIANTS = {
  promo:    "bg-(--zova-accent-soft) text-(--zova-warning) border border-amber-200",
  rank:     "bg-(--zova-green-soft) text-(--zova-primary-action) border border-green-200",
  trending: "bg-purple-50 text-purple-700 border border-purple-200",
  status: {
    pending:   "bg-amber-50 text-amber-700 border border-amber-200",
    active:    "bg-(--zova-green-soft) text-(--zova-primary-action) border border-green-200",
    cancelled: "bg-red-50 text-red-600 border border-red-200",
    completed: "bg-blue-50 text-blue-700 border border-blue-200",
    default:   "bg-gray-100 text-gray-600 border border-gray-200",
  },
};

export default function Badge({ variant = "status", status, className = "", children }) {
  let cls;
  if (variant === "status") {
    cls = VARIANTS.status[status] ?? VARIANTS.status.default;
  } else {
    cls = VARIANTS[variant] ?? VARIANTS.status.default;
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        cls,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
