/**
 * StatusBadge
 * A pill-shaped status badge. Callers pass their own color class via `className`
 * since status-to-color mappings differ per domain (products, payouts, team).
 *
 * Props:
 *   label     — (string) displayed text
 *   className — (string) color classes, e.g. "bg-green-100 text-green-800"
 */
export default function StatusBadge({ label, className = '' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${className}`}
    >
      {label}
    </span>
  );
}
