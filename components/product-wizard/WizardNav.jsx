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
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pt-5 border-t border-[#dbe7e0]/60">
      <div>
        {showCancel && onCancel && (
          <button type="button" onClick={onCancel}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            ← Cancel
          </button>
        )}
        {showBack && onBack && (
          <button type="button" onClick={onBack}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
            ← Back
          </button>
        )}
        {!showBack && !showCancel && <div />}
      </div>
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled || nextLoading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2E5C45] text-white text-sm font-bold hover:bg-[#254a38] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all">
          {nextLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{nextLabel} →</>
          )}
        </button>
      )}
    </div>
  );
}
