// app/seller/products/new/step-2/page.jsx
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { MATERIALS, GENDERS, AGE_GROUPS } from "@/lib/product-wizard-constants";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi";

export default function Step2Page() {
  const { state, dispatch, goNext, goBack, currentStep } = useWizard();
  const [errors, setErrors] = useState({});
  const [showBackWarning, setShowBackWarning] = useState(false);

  const update = (field, value) => {
    dispatch({ type: "SET_BASIC_INFO", payload: { [field]: value } });
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validate = () => {
    const e = {};
    if (!state.productName?.trim()) e.productName = "Product name is required";
    if (!state.material) e.material = "Material is required";
    if (!state.description?.trim()) e.description = "Description is required";
    else if (state.description.trim().length < 10) e.description = "At least 10 characters";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    goNext();
  };

  const handleBack = () => {
    // Warn: going back to step 1 resets category context
    if (state.productName || state.description || state.material) {
      setShowBackWarning(true);
    } else {
      goBack();
    }
  };

  const confirmBack = () => {
    dispatch({ type: "RESET" });
    setShowBackWarning(false);
    goBack();
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900
     transition-all duration-200 focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]
     ${errors[field] ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"}`;

  return (
    <WizardShell
      title="Product Details"
      subtitle="Enter the core information about your product"
    >
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            className={fieldClass("productName")}
            placeholder="e.g. Men's Cotton Casual Shirt"
            value={state.productName}
            onChange={(e) => update("productName", e.target.value)}
          />
          {errors.productName && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.productName}</p>}
        </div>

        {/* Brand + Material row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
            <input
              className={fieldClass("brand")}
              placeholder="e.g. Nike, Adidas (optional)"
              value={state.brand}
              onChange={(e) => update("brand", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Material <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                className={fieldClass("material") + " appearance-none pr-10 cursor-pointer"}
                value={state.material}
                onChange={(e) => update("material", e.target.value)}
              >
                <option value="">Select material</option>
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.material && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.material}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            className={fieldClass("description") + " resize-none"}
            placeholder="Describe the product including fit, style, care instructions…"
            value={state.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.description
              ? <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.description}</p>
              : <span />
            }
            <span className={`text-xs ${(state.description?.length || 0) < 10 ? "text-gray-400" : "text-[#2E5C45]"}`}>
              {state.description?.length || 0} / 2000
            </span>
          </div>
        </div>

        {/* Gender + Age Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <div className="relative">
              <select
                className={fieldClass("gender") + " appearance-none pr-10 cursor-pointer"}
                value={state.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Select gender (optional)</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {state.category === "kids" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
              <div className="relative">
                <select
                  className={fieldClass("ageGroup") + " appearance-none pr-10 cursor-pointer"}
                  value={state.ageGroup}
                  onChange={(e) => update("ageGroup", e.target.value)}
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      <WizardNav
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Continue to Variants"
      />

      {/* Back warning modal */}
      {showBackWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Go Back to Category?</h3>
              <p className="text-sm text-gray-500">
                Changing the category will reset all product information you&apos;ve entered so far.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowBackWarning(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm hover:bg-[#254a38] transition-colors">
                Stay Here
              </button>
              <button onClick={confirmBack}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors">
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
