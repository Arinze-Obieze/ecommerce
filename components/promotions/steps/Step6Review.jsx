'use client';
import BadgePreview from '../BadgePreview';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}

function fmt(dt) {
  if (!dt) return null;
  try { return new Date(dt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return dt; }
}

export default function Step6Review({ state, onSubmit, onDraft, saving }) {
  const {
    targetingScope, wholeStore, selectedProductIds, selectedCategories,
    displayName, displayTag, discountType, discountValue, maxDiscountCap,
    minOrderAmount, buyXQuantity, getYQuantity, allowsBundle,
    promoCode, usePromoCode, startsAt, endsAt, hasEndDate,
    discountTypeLabel, promotionTypeLabel, promotionTypeIcon,
    badgeBgColor, badgeTextColor, tagBgColor, tagTextColor, showSavingsAmount,
  } = state;

  const targetingSummary = wholeStore
    ? 'All your products (whole store)'
    : targetingScope === 'single'
    ? '1 product selected'
    : targetingScope === 'bulk'
    ? `${selectedProductIds.length} products selected`
    : selectedCategories.length > 0
    ? `${selectedCategories.length} categor${selectedCategories.length > 1 ? 'ies' : 'y'}`
    : '—';

  const discountSummary = discountType === 'percentage'
    ? `${discountValue}% off${maxDiscountCap ? `, max ₦${Number(maxDiscountCap).toLocaleString('en-NG')}` : ''}`
    : discountType === 'fixed_amount'
    ? `₦${Number(discountValue).toLocaleString('en-NG')} off`
    : allowsBundle
    ? `Buy ${buyXQuantity} get ${getYQuantity} free`
    : '—';

  const scheduleSummary = `Starts ${fmt(startsAt) || 'now'} · ${hasEndDate && endsAt ? `Ends ${fmt(endsAt)}` : 'No end date'}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Review & Launch</h2>
        <p className="text-sm text-gray-500 mt-1">Check everything looks right before submitting.</p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
        <Row label="Targeting" value={targetingSummary} />
        {promotionTypeLabel && (
          <Row label="Type" value={`${promotionTypeIcon || ''} ${promotionTypeLabel}`} />
        )}
        <Row label="Discount" value={discountSummary} />
        {minOrderAmount && (
          <Row label="Min order" value={`₦${Number(minOrderAmount).toLocaleString('en-NG')}`} />
        )}
        {usePromoCode && promoCode && (
          <Row label="Promo code" value={promoCode} />
        )}
        <Row label="Schedule" value={scheduleSummary} />
      </div>

      {/* Badge preview */}
      <BadgePreview
        displayName={displayName}
        displayTag={displayTag}
        discountType={discountType}
        discountValue={discountValue}
        maxCap={maxDiscountCap}
        badgeBg={badgeBgColor}
        badgeText={badgeTextColor}
        tagBg={tagBgColor}
        tagText={tagTextColor}
        showSavings={showSavingsAmount}
      />

      {/* Approval notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
        <span className="text-lg flex-shrink-0">⏳</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Will go live after Zova reviews it</p>
          <p className="text-xs text-amber-700 mt-0.5">Usually within 2 hours. You'll be notified when it's approved.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => onDraft()}
          disabled={saving}
          className="flex-1 py-3 rounded-xl border-2 border-[#dbe7e0] text-sm font-semibold text-gray-700 hover:border-gray-300 disabled:opacity-50 transition-all"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-[#2E5C45] text-white text-sm font-bold hover:bg-[#254a38] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
          ) : (
            'Submit for Review →'
          )}
        </button>
      </div>
    </div>
  );
}
