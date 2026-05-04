export default function PriceBucketButton({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border px-2.5 py-2 text-left text-[11px] font-semibold transition-all"
      style={{
        borderColor: isActive ? 'var(--zova-primary-action)' : 'var(--zova-border)',
        backgroundColor: isActive ? 'var(--zova-green-soft)' : '#FFFFFF',
        color: isActive ? 'var(--zova-primary-action)' : 'var(--zova-text-body)',
      }}
    >
      {label}
    </button>
  );
}
