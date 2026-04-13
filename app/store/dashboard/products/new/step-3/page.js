// app/store/dashboard/products/new/step-3/page.js
"use client";
import React from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import {
  COUNTRIES,
  WASHING_OPTIONS,
  BLEACHING_OPTIONS,
  DRYING_OPTIONS,
  IRONING_OPTIONS,
  DRY_CLEANING_OPTIONS,
  requiresComplianceForCategory,
} from "@/lib/product-wizard-constants";

export default function Step3() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const compliance = requiresComplianceForCategory(state.category);

  const handleNext = () => {
    // Basic validation, since this step is mostly optional or handled in backend
    // but if compliance is active, we should gently warn or let the backend do it.
    goNext();
  };

  const fc = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]";

  return (
    <WizardShell title="Specifications & Labels" subtitle="Optional details, manufacturing origin, and compliance labels.">
      <div className={compliance ? "grid grid-cols-1 gap-4 xl:grid-cols-12" : "space-y-4"}>
        <section className={compliance ? "xl:col-span-5" : ""}>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <h3 className="text-sm font-bold text-gray-900">General Specifications</h3>
            <p className="mt-0.5 text-xs text-gray-500">Short summary customers see first.</p>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Specification Summary</label>
            <textarea
              rows={4}
              className={fc + " resize-none"}
              placeholder="E.g. A lightweight breathable tee perfect for summer."
              value={state.specificationSummary || ""}
              onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { specificationSummary: e.target.value } })}
            />
          </div>
        </section>

        {compliance && (
          <section className="space-y-4 xl:col-span-7">
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
              <h3 className="text-sm font-bold text-purple-900">Apparel Compliance Required</h3>
              <p className="mt-0.5 text-xs text-purple-800/80">Required for this category before approval.</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3.5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Manufacturing Origin</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Country of Origin</label>
                  <select className={fc} value={state.countryOfOrigin || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { countryOfOrigin: e.target.value } })}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Country of Transformation</label>
                  <select className={fc} value={state.countryOfTransformation || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { countryOfTransformation: e.target.value } })}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3.5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Care Instructions</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <select className={fc} value={state.careWashing || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careWashing: e.target.value } })}>
                  <option value="">Washing...</option>
                  {WASHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className={fc} value={state.careBleaching || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careBleaching: e.target.value } })}>
                  <option value="">Bleaching...</option>
                  {BLEACHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className={fc} value={state.careDrying || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careDrying: e.target.value } })}>
                  <option value="">Drying...</option>
                  {DRYING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className={fc} value={state.careIroning || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careIroning: e.target.value } })}>
                  <option value="">Ironing...</option>
                  {IRONING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className={fc} value={state.careDryCleaning || ""} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careDryCleaning: e.target.value } })}>
                  <option value="">Dry cleaning...</option>
                  {DRY_CLEANING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}
      </div>

      <WizardNav showBack={true} showCancel={false} onBack={goBack} onNext={handleNext} nextLabel="Continue to Discounts" />
    </WizardShell>
  );
}
