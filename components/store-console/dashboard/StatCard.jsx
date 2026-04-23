/**
 * StatCard
 * A stat tile with a small label, an optional loading skeleton, and a value.
 *
 * Props:
 *   label    — (string)
 *   value    — (string | number) rendered when not loading
 *   loading  — (boolean) shows animated skeleton instead of value
 *   tone     — 'brand' | 'amber' | 'red' | 'slate' | 'default'
 *              controls value text color; defaults to 'brand'
 */
const TONE_CLASSES = {
  brand: 'text-[#2E6417]',
  amber: 'text-amber-700',
  red: 'text-red-700',
  slate: 'text-slate-900',
  default: 'text-gray-900',
};

export default function StatCard({ label, value, loading = false, tone = 'brand' }) {
  const valueClass = TONE_CLASSES[tone] ?? TONE_CLASSES.brand;

  return (
    <div className="zova-kpi px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
        {label}
      </p>
      <p className={`mt-1.5 break-words text-lg font-bold leading-tight sm:text-xl ${valueClass}`}>
        {loading ? (
          <span
            className="mt-1.5 block h-7 w-20 animate-pulse rounded-md bg-gray-200"
            aria-hidden="true"
          />
        ) : (
          value
        )}
      </p>
    </div>
  );
}
