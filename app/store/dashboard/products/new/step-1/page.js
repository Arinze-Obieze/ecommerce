// app/store/dashboard/products/new/step-1/page.js
"use client";
import React, { useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { CATEGORIES, SUBCATEGORIES, MATERIALS, GENDERS, AGE_GROUPS } from "@/lib/product-wizard-constants";
import { useToast } from "@/contexts/ToastContext";

function MediaSlot({ slotKey, label, required, preview, mimeType, accept, onUpload, onRemove }) {
  const ref = useRef(null);
  const isVideo = mimeType?.startsWith("video/");

  const handle = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(slotKey, file, URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div className="flex w-full max-w-[128px] flex-col lg:max-w-[112px]">
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handle} />
      {preview ? (
        <div className="relative group overflow-hidden rounded-xl border-2 border-[#2E5C45]/30 bg-gray-50 aspect-square lg:aspect-auto lg:h-24">
          {isVideo ? (
            <video src={preview} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={() => onRemove(slotKey)} className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="aspect-square cursor-pointer rounded-xl border-2 border-dashed border-[#dbe7e0] bg-white transition-all hover:border-[#2E5C45]/40 hover:bg-[#2E5C45]/5 flex flex-col items-center justify-center gap-1.5 lg:aspect-auto lg:h-24">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          <span className="text-[10px] text-gray-500 font-medium">Upload</span>
        </button>
      )}
      <p className="text-[11px] font-semibold text-gray-600 mt-1.5 text-center truncate">{label}{required && <span className="text-red-400"> *</span>}</p>
    </div>
  );
}

export default function Step1() {
  const { state, dispatch, goNext, exitWizard } = useWizard();
  const { error: showError } = useToast();
  const [errors, setErrors] = useState({});
  const [showExit, setShowExit] = useState(false);

  const subs = state.category ? SUBCATEGORIES[state.category] || [] : [];

  const setBasicInfo = (field, value) => {
    dispatch({ type: "SET_BASIC_INFO", payload: { [field]: value } });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const setCategory = (cat) => {
    dispatch({ type: "SET_CATEGORY", payload: cat });
    if (cat !== "kids" && state.ageGroup) {
      dispatch({ type: "SET_BASIC_INFO", payload: { ageGroup: "" } });
    }
    if (errors.category) setErrors(prev => { const n = { ...prev }; delete n.category; return n; });
  };

  const persistedMimeType = (key) => state.persistedImages?.[key]?.mimeType || "";

  const uploadMedia = (key, file, preview) => {
    if (file.size > 15 * 1024 * 1024) {
      showError("Media files must be 15 MB or smaller."); return;
    }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
    if (!isImage && !isVideo) {
      showError("Upload JPG, PNG, WebP, MP4, WebM, or MOV files only."); return;
    }
    dispatch({ type: "SET_IMAGE", key, file, preview });
    setErrors(prev => { const n = { ...prev }; delete n.images; return n; });
  };

  const validate = () => {
    const e = {};
    if (!state.category) e.category = "Category is required";
    if (!state.subcategory) e.subcategory = "Subcategory is required";
    if (!state.productName?.trim()) e.productName = "Product name is required";
    if (!state.material) e.material = "Material is required";
    if (!state.description?.trim()) e.description = "Description is required";
    else if (state.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      showError("Please correctly fill in all highlighted fields and upload required media.");
      return;
    }
    goNext();
  };

  const fc = (f) => `w-full rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45] ${errors[f] ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"}`;

  return (
    <WizardShell title="Core Details & Media" subtitle="Select category, describe your product, and optionally add base visuals.">
      {Object.keys(errors).length > 0 && (
        <div className="p-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-5">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="font-medium">Please correct the highlighted errors to continue.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-start">
        <div className="space-y-5 xl:col-span-7">
          {/* Category */}
          <div className="space-y-3 rounded-2xl border border-[#dbe7e0] bg-white p-4 lg:p-5">
            <label className="block text-sm font-semibold text-gray-700">Category <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {CATEGORIES.map((cat) => {
                const sel = state.category === cat.value;
                return (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)} className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3.5 transition-all duration-200 lg:p-3 ${sel ? "border-[#2E5C45] bg-[#2E5C45]/5" : "border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40"} ${errors.category && !sel ? "border-red-300 bg-red-50" : ""}`}>
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className={`text-xs font-bold text-center ${sel ? "text-[#2E5C45]" : "text-gray-900"}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-3 rounded-2xl border border-[#dbe7e0] bg-white p-4 lg:p-5">
            <div className="rounded-xl border border-[#dbe7e0] bg-[#f8fbf9] px-3 py-2.5">
              <p className="text-xs font-semibold text-gray-600">Quick attributes</p>
              <p className="mt-0.5 text-[11px] text-gray-500">Most products can be completed from these fields first.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Product Name <span className="text-red-400">*</span></label>
                <input className={fc("productName")} placeholder="e.g. Men's Cotton Casual Shirt" value={state.productName} onChange={(e) => setBasicInfo("productName", e.target.value)} />
                {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subcategory <span className="text-red-400">*</span></label>
                <select
                  value={state.subcategory || ""}
                  onChange={(e) => dispatch({ type: "SET_SUBCATEGORY", payload: e.target.value || null })}
                  className={fc("subcategory")}
                  disabled={!state.category}
                >
                  <option value="">{state.category ? "Select a subcategory…" : "Select category first"}</option>
                  {subs.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subcategory && <p className="mt-1 text-xs text-red-500">{errors.subcategory}</p>}
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Material <span className="text-red-400">*</span></label>
                <select className={fc("material")} value={state.material} onChange={(e) => setBasicInfo("material", e.target.value)}>
                  <option value="">Select material</option>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.material && <p className="mt-1 text-xs text-red-500">{errors.material}</p>}
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Brand</label>
                <input className={fc("brand")} placeholder="Optional" value={state.brand} onChange={(e) => setBasicInfo("brand", e.target.value)} />
              </div>

              <div className="lg:col-span-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Gender</label>
                <select className={fc("gender")} value={state.gender} onChange={(e) => setBasicInfo("gender", e.target.value)}>
                  <option value="">Optional</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {state.category === "kids" && (
                <div className="lg:col-span-4">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Age Group</label>
                  <select className={fc("ageGroup")} value={state.ageGroup} onChange={(e) => setBasicInfo("ageGroup", e.target.value)}>
                    <option value="">Select</option>
                    {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}

              <div className="lg:col-span-12">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Description <span className="text-red-400">*</span></label>
                <textarea rows={3} className={fc("description") + " resize-none"} placeholder="Describe the product details, fit, and important notes..." value={state.description} onChange={(e) => setBasicInfo("description", e.target.value)} />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>Keep it short and scannable. You can refine later.</span>
                  <span>{state.description?.length || 0}/2000</span>
                </div>
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="xl:col-span-5 xl:sticky xl:top-4">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-4 lg:p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Product Media</h3>
            <p className="text-xs text-gray-500 mb-4">Upload base visuals now, then choose strategy-specific variant media in the next step.</p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
              {[
                { key: "general_front", label: "Front View", required: true },
                { key: "general_back", label: "Back View", required: true },
                { key: "general_side", label: "Side View", required: false },
                { key: "general_detail", label: "Detail Shot", required: false },
              ].map((slot) => (
                <MediaSlot
                  key={slot.key}
                  slotKey={slot.key}
                  label={slot.label}
                  required={slot.required}
                  preview={state.imagePreviews[slot.key]}
                  mimeType={state.images[slot.key]?.type || persistedMimeType(slot.key)}
                  accept="image/jpeg,image/png,image/webp"
                  onUpload={uploadMedia}
                  onRemove={(k) => dispatch({ type: "REMOVE_IMAGE", key: k })}
                />
              ))}
            </div>
            {errors.images && <p className="mt-2 text-xs font-semibold text-red-500">{errors.images}</p>}
          </div>
        </div>
      </div>

      <WizardNav
        showBack={false} showCancel={true}
        onCancel={() => setShowExit(true)}
        onNext={handleNext}
        nextLabel="Continue to Variants"
      />

      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Registration?</h3>
            <p className="text-sm text-gray-500 mb-5">Drafts are saved automatically, so you can resume later.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExit(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">Stay</button>
              <button onClick={exitWizard} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2E5C45] text-white font-semibold text-sm hover:bg-[#254a38]">Exit</button>
            </div>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
