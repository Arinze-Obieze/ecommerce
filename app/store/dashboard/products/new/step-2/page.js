"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { MATERIALS, GENDERS, AGE_GROUPS, MOODS } from "@/lib/product-wizard-constants";

const MAX_MOODS = 3;

export default function Step2() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [errors, setErrors] = useState({});
  const [showBackWarn, setShowBackWarn] = useState(false);

  const set = (field, value) => {
    dispatch({ type: "SET_BASIC_INFO", payload: { [field]: value } });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleMood = (key) => {
    const current = state.moodTags || [];
    if (current.includes(key)) {
      dispatch({ type: "SET_BASIC_INFO", payload: { moodTags: current.filter(k => k !== key) } });
    } else {
      if (current.length >= MAX_MOODS) return;
      dispatch({ type: "SET_BASIC_INFO", payload: { moodTags: [...current, key] } });
    }
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

  const fc = (f) =>
    `w-full px-3 py-3 rounded-xl border text-sm font-medium transition-all focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] ${
      errors[f] ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"
    }`;

  const moodTags = state.moodTags || [];
  const remaining = MAX_MOODS - moodTags.length;

  return (
    <WizardShell title="Product Details" subtitle="Enter the core information about your product">
      <div className="space-y-5">

        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            className={fc("productName")}
            placeholder="e.g. Men's Cotton Casual Shirt"
            value={state.productName}
            onChange={(e) => set("productName", e.target.value)}
          />
          {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
        </div>

        {/* Brand + Material */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
            <input
              className={fc("brand")}
              placeholder="Optional"
              value={state.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Material <span className="text-red-400">*</span>
            </label>
            <select className={fc("material")} value={state.material} onChange={(e) => set("material", e.target.value)}>
              <option value="">Select material</option>
              {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.material && <p className="mt-1 text-xs text-red-500">{errors.material}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            className={fc("description") + " resize-none"}
            placeholder="Describe the product…"
            value={state.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <span className="text-xs text-gray-400">{state.description?.length || 0}/2000</span>
          </div>
        </div>

        {/* Gender + Age Group */}
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

        {/* Mood Tags */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Occasion / Mood
              <span className="ml-1.5 text-xs font-normal text-gray-400">(optional — pick up to 3)</span>
            </label>
            {moodTags.length > 0 && (
              <span className="text-xs font-semibold text-[#2E5C45]">
                {remaining === 0 ? "Max selected" : `${remaining} left`}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Tell buyers when to wear this. Honest tagging helps your product appear in the right mood collections.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOODS.map((mood) => {
              const selected = moodTags.includes(mood.key);
              const disabled = !selected && remaining === 0;
              return (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => toggleMood(mood.key)}
                  disabled={disabled}
                  className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all
                    ${selected
                      ? "border-[#2E5C45] bg-[#2E5C45]/5 ring-1 ring-[#2E5C45]/20"
                      : disabled
                        ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                        : "border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40 hover:bg-[#f7fbf8] cursor-pointer"
                    }`}
                >
                  {selected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2E5C45] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-xl leading-none">{mood.emoji}</span>
                  <span className={`text-xs font-bold leading-tight ${selected ? "text-[#2E5C45]" : "text-gray-800"}`}>
                    {mood.label}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight">{mood.desc}</span>
                </button>
              );
            })}
          </div>

          {moodTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {moodTags.map((key) => {
                const mood = MOODS.find(m => m.key === key);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2E5C45]/10 text-[#2E5C45] text-xs font-semibold"
                  >
                    {mood?.emoji} {mood?.label}
                    <button
                      type="button"
                      onClick={() => toggleMood(key)}
                      className="ml-0.5 text-[#2E5C45]/60 hover:text-[#2E5C45] leading-none"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
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
              <button
                onClick={() => setShowBackWarn(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm"
              >
                Stay
              </button>
              <button
                onClick={() => { dispatch({ type: "RESET" }); setShowBackWarn(false); goBack(); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}