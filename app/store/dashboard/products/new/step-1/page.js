// app/store/dashboard/products/new/step-1/page.js
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/product-wizard-constants";

export default function Step1() {
  const { state, dispatch, goNext, exitWizard } = useWizard();
  const [showExit, setShowExit] = useState(false);

  const subs = state.category ? SUBCATEGORIES[state.category] || [] : [];

  return (
    <WizardShell title="Select Product Category" subtitle="Choose the main category and subcategory for your product">
      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const sel = state.category === cat.value;
          return (
            <button key={cat.value} type="button"
              onClick={() => dispatch({ type: "SET_CATEGORY", payload: cat.value })}
              className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200
                ${sel ? "border-[#2E5C45] bg-[#2E5C45]/5 shadow-sm" : "border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40"}`}>
              {sel && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2E5C45] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-3xl">{cat.icon}</span>
              <span className={`text-sm font-bold text-center ${sel ? "text-[#2E5C45]" : "text-gray-900"}`}>{cat.label}</span>
              <span className="text-[11px] text-gray-400 text-center hidden sm:block">{cat.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory */}
      {state.category && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Subcategory <span className="text-red-400">*</span>
          </label>
          <select
            value={state.subcategory || ""}
            onChange={(e) => dispatch({ type: "SET_SUBCATEGORY", payload: e.target.value || null })}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] transition-all">
            <option value="">Select a subcategory…</option>
            {subs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <WizardNav
        showBack={false} showCancel={true}
        onCancel={() => setShowExit(true)}
        onNext={() => { if (state.category && state.subcategory) goNext(); }}
        nextLabel="Continue to Details"
        nextDisabled={!state.category || !state.subcategory}
      />

      {/* Exit modal */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Registration?</h3>
            <p className="text-sm text-gray-500 mb-5">Any data you've entered will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExit(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">Stay</button>
              <button onClick={exitWizard} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600">Exit</button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
