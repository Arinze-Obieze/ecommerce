// components/product-wizard/WizardNav.jsx
"use client";
import React from "react";

export default function WizardNav({
  onBack, onNext, onCancel,
  nextLabel = "Continue",
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
  showCancel = false,
}) {
  const computedNextLabel = typeof nextLabel === "string" && nextLabel.trim().toLowerCase().startsWith("continue to")
    ? "Continue"
    : nextLabel;

  return (
    <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-[#E8E4DC]/60">
      <div className="flex items-center gap-2">
        {showCancel && onCancel && (
          <button type="button" onClick={onCancel}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            ← Cancel
          </button>
        )}
        {showBack && onBack && (
          <button type="button" onClick={onBack}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            ← Back
          </button>
        )}
        {!showBack && !showCancel && <div />}
      </div>
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled || nextLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2E6417] text-white text-sm font-bold hover:bg-[#245213] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all whitespace-nowrap">
          {nextLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{computedNextLabel} →</>
          )}
        </button>
      )}
    </div>
  );
}
