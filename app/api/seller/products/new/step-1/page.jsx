// app/seller/products/new/step-1/page.jsx
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/product-wizard-constants";
import { FiChevronDown } from "react-icons/fi";

export default function Step1Page() {
  const { state, dispatch, goNext, exitWizard } = useWizard();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleCategorySelect = (value) => {
    dispatch({ type: "SET_CATEGORY", payload: value });
  };

  const handleNext = () => {
    if (!state.category || !state.subcategory) return;
    goNext();
  };

  const subcategories = state.category ? SUBCATEGORIES[state.category] || [] : [];

  return (
    <WizardShell
      title="Select Product Category"
      subtitle="Choose the main category and subcategory for your product"
    >
      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = state.category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategorySelect(cat.value)}
              className={`
                group relative flex flex-col items-center gap-2 p-5 sm:p-6
                rounded-2xl border-2 transition-all duration-200
                ${isSelected
                  ? "border-[#2E5C45] bg-[#2E5C45]/5 shadow-md shadow-[#2E5C45]/10"
                  : "border-gray-100 bg-white hover:border-[#2E5C45]/30 hover:shadow-sm"
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#2E5C45] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <span className="text-3xl sm:text-4xl">{cat.icon}</span>
              <span className={`text-sm font-bold text-center leading-tight ${
                isSelected ? "text-[#2E5C45]" : "text-gray-900"
              }`}>
                {cat.label}
              </span>
              <span className="text-xs text-gray-400 text-center leading-snug hidden sm:block">
                {cat.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subcategory dropdown */}
      {state.category && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subcategory <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={state.subcategory || ""}
              onChange={(e) => dispatch({ type: "SET_SUBCATEGORY", payload: e.target.value || null })}
              className="w-full appearance-none px-4 py-3.5 pr-10 rounded-xl border border-gray-200
                         bg-white text-gray-900 font-medium text-sm
                         focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]
                         transition-all cursor-pointer"
            >
              <option value="">Select a subcategory…</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Nav */}
      <WizardNav
        showBack={false}
        showCancel={true}
        onCancel={() => setShowExitConfirm(true)}
        onNext={handleNext}
        nextLabel="Continue to Details"
        nextDisabled={!state.category || !state.subcategory}
      />

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Registration?</h3>
              <p className="text-sm text-gray-500">
                Any data you&apos;ve entered will be lost. You&apos;ll need to start over.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={exitWizard}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
