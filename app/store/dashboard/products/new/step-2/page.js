// app/store/dashboard/products/new/step-2/page.js
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { MATERIALS, GENDERS, AGE_GROUPS } from "@/lib/product-wizard-constants";

export default function Step2() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [errors, setErrors] = useState({});
  const [showBackWarn, setShowBackWarn] = useState(false);

  const set = (field, value) => {
    dispatch({ type: "SET_BASIC_INFO", payload: { [field]: value } });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!state.productName?.trim()) e.productName = "Required";
    if (!state.material) e.material = "Required";
    if (!state.description?.trim()) e.description = "Required";
    else if (state.description.trim().length < 10) e.description = "Min 10 characters";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    goNext();
  };

  const handleBack = () => {
    if (state.productName || state.description || state.material) setShowBackWarn(true);
    else goBack();
  };

  const fc = (f) => `w-full px-3 py-3 rounded-xl border text-sm font-medium transition-all focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] ${errors[f] ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"}`;

  return (
    <WizardShell title="Product Details" subtitle="Enter the core information about your product">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-400">*</span></label>
          <input className={fc("productName")} placeholder="e.g. Men's Cotton Casual Shirt" value={state.productName} onChange={(e) => set("productName", e.target.value)} />
          {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
            <input className={fc("brand")} placeholder="Optional" value={state.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Material <span className="text-red-400">*</span></label>
            <select className={fc("material")} value={state.material} onChange={(e) => set("material", e.target.value)}>
              <option value="">Select material</option>
              {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.material && <p className="mt-1 text-xs text-red-500">{errors.material}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-red-400">*</span></label>
          <textarea rows={4} className={fc("description") + " resize-none"} placeholder="Describe the product…" value={state.description} onChange={(e) => set("description", e.target.value)} />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <span className="text-xs text-gray-400">{state.description?.length || 0}/2000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
            <select className={fc("gender")} value={state.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Optional</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {state.category === "kids" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age Group</label>
              <select className={fc("ageGroup")} value={state.ageGroup} onChange={(e) => set("ageGroup", e.target.value)}>
                <option value="">Select</option>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <WizardNav onBack={handleBack} onNext={handleNext} nextLabel="Continue to Variants" />

      {showBackWarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Go Back?</h3>
            <p className="text-sm text-gray-500 mb-5">Changing category resets all product info.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackWarn(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm">Stay</button>
              <button onClick={() => { dispatch({ type: "RESET" }); setShowBackWarn(false); goBack(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm">Go Back</button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
