// app/seller/products/new/step-4/page.jsx
"use client";
import React, { useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import {
  IMAGE_STRATEGIES, GENERAL_IMAGE_SLOTS, VARIANT_IMAGE_SLOTS, getColorTw,
} from "@/lib/product-wizard-constants";
import {
  FiCamera, FiUploadCloud, FiX, FiLayers, FiGrid, FiCheck,
  FiChevronDown, FiChevronUp, FiMessageSquare
} from "react-icons/fi";

// ─── Single image upload slot ───────────────────────────────────────────────

function ImageSlot({ slotKey, label, required, preview, onUpload, onRemove }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB per image"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { alert("JPG, PNG or WebP only"); return; }
    const previewUrl = URL.createObjectURL(file);
    onUpload(slotKey, file, previewUrl);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-[#2E5C45]/30 aspect-square bg-gray-50">
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={() => onRemove(slotKey)}
              className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#2E5C45] text-white text-[10px] font-bold flex items-center gap-1">
            <FiCheck className="w-3 h-3" /> Done
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-gray-200 aspect-square flex flex-col items-center justify-center gap-2 hover:border-[#2E5C45]/40 hover:bg-[#2E5C45]/5 transition-all cursor-pointer">
          <FiUploadCloud className="w-6 h-6 text-gray-400" />
          <span className="text-[11px] text-gray-500 font-medium text-center px-2 leading-tight">Tap to upload</span>
        </button>
      )}

      <p className="text-xs font-semibold text-gray-600 mt-2 text-center truncate">
        {label} {required && <span className="text-red-400">*</span>}
      </p>
    </div>
  );
}

// ─── Main Step 4 Component ──────────────────────────────────────────────────

export default function Step4Page() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [error, setError] = useState(null);
  const [expandedColors, setExpandedColors] = useState({});

  const handleUpload = (key, file, preview) => {
    dispatch({ type: "SET_IMAGE", key, file, preview });
  };
  const handleRemove = (key) => {
    dispatch({ type: "REMOVE_IMAGE", key });
  };

  const toggleColorExpand = (color) => {
    setExpandedColors((prev) => ({ ...prev, [color]: !prev[color] }));
  };

  // Unique colors from variants
  const uniqueColors = [...new Set(state.variants.map((v) => v.color).filter(Boolean))];

  const validate = () => {
    const s = state.imageStrategy;
    if (s === "general") {
      if (!state.images["general_front"] || !state.images["general_back"]) {
        return "Upload at least Front and Back view images.";
      }
    } else if (s === "variant") {
      for (const color of uniqueColors) {
        const safe = color.replace(/\s/g, "_");
        if (!state.images[`variant_${safe}_front`] || !state.images[`variant_${safe}_back`]) {
          return `Upload Front and Back for ${color} variant.`;
        }
      }
    } else if (s === "mixed") {
      if (!state.images["mixed_general_front"] || !state.images["mixed_general_back"]) {
        return "Upload at least General Front and Back images.";
      }
    }
    return null;
  };

  const handleNext = () => {
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    goNext();
  };

  return (
    <WizardShell
      title="Product Images"
      subtitle="Upload photos for your product variants"
    >
      {error && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-6 text-sm text-red-700">
          <FiX className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      {/* ── Strategy Selector ─────────────────────────────────── */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Upload Strategy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {IMAGE_STRATEGIES.map((s) => {
            const isSelected = state.imageStrategy === s.value;
            return (
              <button key={s.value} type="button"
                onClick={() => dispatch({ type: "SET_IMAGE_STRATEGY", payload: s.value })}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${isSelected
                    ? "border-[#2E5C45] bg-[#2E5C45]/5"
                    : "border-gray-100 hover:border-[#2E5C45]/30"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-[#2E5C45] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {s.icon === "layers" ? <FiLayers className="w-4 h-4" /> :
                   s.icon === "palette" ? <FiGrid className="w-4 h-4" /> :
                   <FiCamera className="w-4 h-4" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isSelected ? "text-[#2E5C45]" : "text-gray-900"}`}>{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Image Upload Grids ────────────────────────────────── */}

      {/* Strategy: General */}
      {state.imageStrategy === "general" && (
        <div className="mb-6">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
            <p className="text-xs text-blue-800 font-medium">
              These images apply to all {state.variants.length} variants.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {GENERAL_IMAGE_SLOTS.map((slot) => (
              <ImageSlot
                key={slot.key}
                slotKey={`general_${slot.key}`}
                label={slot.label}
                required={slot.required}
                preview={state.imagePreviews[`general_${slot.key}`]}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strategy: Variant */}
      {state.imageStrategy === "variant" && (
        <div className="space-y-4 mb-6">
          {uniqueColors.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No color variants found. Go back and add variants with colors.
            </div>
          ) : (
            uniqueColors.map((color) => {
              const safe = color.replace(/\s/g, "_");
              const isOpen = expandedColors[color] !== false; // default open
              const variantSizes = state.variants.filter((v) => v.color === color).map((v) => v.size);

              return (
                <div key={color} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleColorExpand(color)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <span className={`w-5 h-5 rounded-full ${getColorTw(color)} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-gray-900">{color}</span>
                      <span className="text-xs text-gray-500 ml-2">Sizes: {variantSizes.join(", ")}</span>
                    </div>
                    {isOpen ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {VARIANT_IMAGE_SLOTS.map((slot) => (
                          <ImageSlot
                            key={slot.key}
                            slotKey={`variant_${safe}_${slot.key}`}
                            label={slot.label}
                            required={slot.required}
                            preview={state.imagePreviews[`variant_${safe}_${slot.key}`]}
                            onUpload={handleUpload}
                            onRemove={handleRemove}
                          />
                        ))}
                      </div>
                      {/* Variant note */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <FiMessageSquare className="w-3 h-3" /> Notes for {color}
                        </label>
                        <textarea rows={2}
                          value={state.variantNotes[color] || ""}
                          onChange={(e) => dispatch({ type: "SET_VARIANT_NOTE", color, note: e.target.value })}
                          placeholder={`Special notes for ${color} variant…`}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Strategy: Mixed */}
      {state.imageStrategy === "mixed" && (
        <div className="space-y-6 mb-6">
          {/* General section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">📦 General Images (all variants)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GENERAL_IMAGE_SLOTS.slice(0, 4).map((slot) => (
                <ImageSlot
                  key={slot.key}
                  slotKey={`mixed_general_${slot.key}`}
                  label={slot.label}
                  required={slot.required}
                  preview={state.imagePreviews[`mixed_general_${slot.key}`]}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
          {/* Optional variant-specific */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">🎨 Variant-Specific (optional)</h4>
            <p className="text-xs text-gray-500 mb-3">Add extra images for specific colors if they look different.</p>
            <div className="space-y-3">
              {uniqueColors.map((color) => {
                const safe = color.replace(/\s/g, "_");
                return (
                  <div key={color} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className={`w-4 h-4 rounded-full ${getColorTw(color)} shrink-0 mt-1`} />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {VARIANT_IMAGE_SLOTS.slice(0, 2).map((slot) => (
                        <ImageSlot
                          key={slot.key}
                          slotKey={`mixed_variant_${safe}_${slot.key}`}
                          label={`${color} ${slot.label}`}
                          required={false}
                          preview={state.imagePreviews[`mixed_variant_${safe}_${slot.key}`]}
                          onUpload={handleUpload}
                          onRemove={handleRemove}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Product Notes ─────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          📝 Product Notes
        </label>
        <textarea rows={3}
          value={state.productNotes}
          onChange={(e) => dispatch({ type: "SET_PRODUCT_NOTES", payload: e.target.value })}
          placeholder="Care instructions, special sizing notes, or any important info…"
          className="w-full px-3 py-2.5 rounded-lg border border-amber-200 bg-white text-sm resize-none focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
      </div>

      <WizardNav
        onBack={goBack}
        onNext={handleNext}
        nextLabel="Continue to SKU"
      />
    </WizardShell>
  );
}
