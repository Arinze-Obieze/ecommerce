export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-8 w-8 border-[3px]" };
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        "inline-block rounded-full border-current border-t-transparent animate-spin text-(--zova-primary-action)",
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
    />
  );
}
