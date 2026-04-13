'use client';

export default function BadgePreview({ displayName, displayTag, discountType, discountValue, maxCap, badgeBg = '#111111', badgeText = '#FFFFFF', tagBg = '#F472B6', tagText = '#FFFFFF', showSavings = true, examplePrice = 15000 }) {
  if (!displayName) return null;

  const savings = discountType === 'percentage'
    ? Math.min(examplePrice * (discountValue / 100), maxCap || Infinity)
    : discountType === 'fixed_amount'
    ? Math.min(discountValue, examplePrice)
    : 0;

  const finalPrice = Math.max(0, examplePrice - savings);

  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-[#f9fafb] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Badge Preview</p>

      {/* Mock product card */}
      <div className="relative w-40 mx-auto rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center text-3xl">👗</div>

        {/* Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: badgeBg, color: badgeText }}
          >
            {displayName}
          </span>
          {displayTag && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm"
              style={{ backgroundColor: tagBg, color: tagText }}
            >
              {displayTag}
            </span>
          )}
        </div>

        <div className="p-2.5">
          <p className="text-xs font-semibold text-gray-800 truncate">Sample Product</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm font-bold text-gray-900">₦{finalPrice.toLocaleString('en-NG')}</span>
            {savings > 0 && (
              <span className="text-[10px] line-through text-gray-400">₦{examplePrice.toLocaleString('en-NG')}</span>
            )}
          </div>
          {showSavings && savings > 0 && (
            <span className="text-[9px] font-semibold text-emerald-600">Save ₦{savings.toLocaleString('en-NG')}</span>
          )}
        </div>
      </div>

      {discountValue > 0 && (
        <p className="text-center text-xs text-gray-500 mt-3">
          On a ₦{examplePrice.toLocaleString('en-NG')} item — customer saves{' '}
          <span className="font-semibold text-gray-800">₦{savings.toLocaleString('en-NG')}</span>, pays{' '}
          <span className="font-semibold text-gray-800">₦{finalPrice.toLocaleString('en-NG')}</span>
        </p>
      )}
    </div>
  );
}
