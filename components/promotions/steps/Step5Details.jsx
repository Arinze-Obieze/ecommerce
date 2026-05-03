'use client';
import { useState } from 'react';
import BadgePreview from '../BadgePreview';

export default function Step5Details({ state, dispatch }) {
  const {
    displayName, displayTag, description, promoCode, usePromoCode,
    allowsCode, startsAt, endsAt, hasEndDate,
    discountType, discountValue, maxDiscountCap,
    badgeBgColor, badgeTextColor, tagBgColor, tagTextColor, showSavingsAmount,
  } = state;

  const handleCodeChange = (val) => {
    dispatch({ type: 'SET_PROMO_CODE', code: val.toUpperCase().replace(/[^A-Z0-9-]/g, '') });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Name and schedule your promotion</h2>
        <p className="text-sm text-gray-500 mt-1">These details appear to buyers on your product cards and at checkout.</p>
      </div>

      {/* Display name */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Badge display name <span className="text-red-400">*</span></label>
        <input
          type="text"
          maxLength={30}
          value={displayName}
          onChange={e => dispatch({ type: 'SET_DISPLAY_NAME', name: e.target.value })}
          placeholder="e.g. Summer Sale, Eid Special"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
        <p className="text-xs text-gray-400 mt-1">{displayName?.length || 0}/30 · This is the badge buyers see on your products</p>
      </div>

      {/* Tag line */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          Tag line <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          maxLength={20}
          value={displayTag}
          onChange={e => dispatch({ type: 'SET_DISPLAY_TAG', tag: e.target.value })}
          placeholder="e.g. Clearance, Last Chance"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
        <p className="text-xs text-gray-400 mt-1">{displayTag?.length || 0}/20 · Appears as a small pill next to the badge</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={e => dispatch({ type: 'SET_DESCRIPTION', text: e.target.value })}
          placeholder="Explain the promotion to buyers at checkout..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Promo code */}
      {allowsCode && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usePromoCode}
              onChange={e => dispatch({ type: 'SET_USE_PROMO_CODE', use: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-semibold text-gray-700">Require a promo code</span>
          </label>
          {usePromoCode && (
            <div>
              <input
                type="text"
                value={promoCode}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="e.g. BIRTHDAY20"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Alphanumeric and hyphens only — auto uppercased</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Start date & time <span className="text-red-400">*</span></label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={e => dispatch({ type: 'SET_STARTS_AT', value: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            End date & time
          </label>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={e => dispatch({ type: 'SET_HAS_END_DATE', has: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs text-gray-600">Set an end date</span>
          </label>
          {hasEndDate && (
            <input
              type="datetime-local"
              value={endsAt}
              min={startsAt}
              onChange={e => dispatch({ type: 'SET_ENDS_AT', value: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          )}
          {!hasEndDate && <p className="text-xs text-gray-400">Runs until you manually stop it</p>}
        </div>
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
    </div>
  );
}
