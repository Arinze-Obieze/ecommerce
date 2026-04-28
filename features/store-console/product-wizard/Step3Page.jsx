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
} from "@/features/product-wizard/lib/constants";

export default function Step3() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const washingValues = new Set(WASHING_OPTIONS.map((o) => o.value));
  const bleachingValues = new Set(BLEACHING_OPTIONS.map((o) => o.value));
  const dryingValues = new Set(DRYING_OPTIONS.map((o) => o.value));
  const ironingValues = new Set(IRONING_OPTIONS.map((o) => o.value));
  const dryCleaningValues = new Set(DRY_CLEANING_OPTIONS.map((o) => o.value));
  const safeValue = (value, allowed) => (allowed.has(value) ? value : "");

  const handleNext = () => {
    goNext();
  };

  const fc = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <WizardShell title="Compliance & Care" subtitle="Optional details for labels, origin, and care instructions.">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="xl:col-span-5">
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

        <section className="space-y-4 xl:col-span-7">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <h3 className="text-sm font-bold text-blue-900">Optional Compliance Details</h3>
            <p className="mt-0.5 text-xs text-blue-800/80">Provide now if available, or skip and continue.</p>
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
              <select className={fc} value={safeValue(state.careWashing, washingValues)} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careWashing: e.target.value || null } })}>
                <option value="">Washing...</option>
                {WASHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={fc} value={safeValue(state.careBleaching, bleachingValues)} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careBleaching: e.target.value || null } })}>
                <option value="">Bleaching...</option>
                {BLEACHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={fc} value={safeValue(state.careDrying, dryingValues)} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careDrying: e.target.value || null } })}>
                <option value="">Drying...</option>
                {DRYING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={fc} value={safeValue(state.careIroning, ironingValues)} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careIroning: e.target.value || null } })}>
                <option value="">Ironing...</option>
                {IRONING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={fc} value={safeValue(state.careDryCleaning, dryCleaningValues)} onChange={(e) => dispatch({ type: "SET_BASIC_INFO", payload: { careDryCleaning: e.target.value || null } })}>
                <option value="">Dry cleaning...</option>
                {DRY_CLEANING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </section>
      </div>

      <WizardNav showBack={true} showCancel={false} onBack={goBack} onNext={handleNext} nextLabel="Continue to Discounts" />
    </WizardShell>
  );
}
