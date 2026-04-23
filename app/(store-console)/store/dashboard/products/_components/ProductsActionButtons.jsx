"use client";

export function ActionIconButton({
  onClick,
  disabled,
  label,
  children,
  tone = 'default',
}) {
  const tones = {
    default: 'border-gray-200 text-gray-700 hover:bg-gray-50',
    brand: 'border-[#2E6417]/20 text-[#2E6417] hover:bg-[#EDF5E6]',
    danger: 'border-red-200 text-red-700 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function BulkButton({ onClick, disabled, label, tone = 'default' }) {
  const tones = {
    default: 'border-gray-200 text-gray-700 hover:bg-gray-50',
    brand: 'border-[#2E6417] text-[#2E6417] hover:bg-[#EDF5E6]',
    danger: 'border-red-200 text-red-700 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}
