// app/store/dashboard/products/new/step-5/page.js
"use client";
import React, { useRef, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { IMAGE_STRATEGIES, GENERAL_IMAGE_SLOTS, VARIANT_IMAGE_SLOTS, getColorTw } from "@/lib/product-wizard-constants";

function Slot({ slotKey, label, required, preview, onUpload, onRemove }) {
  const ref = useRef(null);
  const handle = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Max 5 MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { alert("JPG, PNG or WebP only"); return; }
    onUpload(slotKey, f, URL.createObjectURL(f));
    e.target.value = "";
  };
  return (
    <div className="flex flex-col">
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handle} />
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-[#2E5C45]/30 aspect-square bg-gray-50">
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={() => onRemove(slotKey)} className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#2E5C45] text-white text-[9px] font-bold">✓</div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className="rounded-xl border-2 border-dashed border-[#dbe7e0] aspect-square flex flex-col items-center justify-center gap-1.5 hover:border-[#2E5C45]/40 hover:bg-[#2E5C45]/5 transition-all cursor-pointer">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          <span className="text-[10px] text-gray-500 font-medium">Upload</span>
        </button>
      )}
      <p className="text-[11px] font-semibold text-gray-600 mt-1.5 text-center truncate">{label}{required && <span className="text-red-400"> *</span>}</p>
    </div>
  );
}

export default function Step4() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [error, setError] = useState(null);
  const [openColors, setOpenColors] = useState({});

  const up = (k, f, p) => dispatch({ type: "SET_IMAGE", key: k, file: f, preview: p });
  const rm = (k) => dispatch({ type: "REMOVE_IMAGE", key: k });
  const uniqueColors = [...new Set(state.variants.map(v => v.color).filter(Boolean))];

  const validate = () => {
    const hasImage = (key) => state.images[key] || state.persistedImages[key];
    const s = state.imageStrategy;
    if (s === "general") {
      if (!hasImage("general_front") || !hasImage("general_back")) return "Upload Front and Back views.";
    } else if (s === "variant") {
      for (const c of uniqueColors) {
        const safe = c.replace(/\s/g, "_");
        if (!hasImage(`variant_${safe}_front`) || !hasImage(`variant_${safe}_back`)) return `Upload Front & Back for ${c}.`;
      }
    } else if (s === "mixed") {
      if (!hasImage("mixed_general_front") || !hasImage("mixed_general_back")) return "Upload General Front and Back.";
    }
    return null;
  };

  const handleNext = () => { setError(null); const e = validate(); if (e) { setError(e); return; } goNext(); };

  return (
    <WizardShell title="Product Images" subtitle="Upload photos for your product">
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-5">{error}</div>}

      {/* Strategy selector */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-2.5">Upload Strategy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {IMAGE_STRATEGIES.map(s => {
            const sel = state.imageStrategy === s.value;
            return (
              <button key={s.value} type="button" onClick={() => dispatch({ type: "SET_IMAGE_STRATEGY", payload: s.value })}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${sel ? "border-[#2E5C45] bg-[#2E5C45]/5" : "border-[#dbe7e0] hover:border-[#2E5C45]/30"}`}>
                <p className={`text-sm font-bold ${sel ? "text-[#2E5C45]" : "text-gray-900"}`}>{s.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* General */}
      {state.imageStrategy === "general" && (
        <div className="mb-5">
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
            These images apply to all {state.variants.length} variants.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENERAL_IMAGE_SLOTS.map(sl => (
              <Slot key={sl.key} slotKey={`general_${sl.key}`} label={sl.label} required={sl.required}
                preview={state.imagePreviews[`general_${sl.key}`]} onUpload={up} onRemove={rm} />
            ))}
          </div>
        </div>
      )}

      {/* Variant */}
      {state.imageStrategy === "variant" && (
        <div className="space-y-3 mb-5">
          {uniqueColors.length === 0 ? (
            <p className="text-center py-6 text-sm text-gray-400">No color variants found. Go back and add variants.</p>
          ) : uniqueColors.map(color => {
            const safe = color.replace(/\s/g, "_");
            const open = openColors[color] !== false;
            const varSizes = state.variants.filter(v => v.color === color).map(v => v.size);
            return (
              <div key={color} className="border border-[#dbe7e0] rounded-xl overflow-hidden">
                <button type="button" onClick={() => setOpenColors(p => ({ ...p, [color]: !open }))}
                  className="w-full flex items-center gap-2.5 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className={`w-4 h-4 rounded-full ${getColorTw(color)} shrink-0`} />
                  <span className="text-sm font-bold text-gray-900 flex-1">{color}</span>
                  <span className="text-xs text-gray-500">{varSizes.join(", ")}</span>
                  <span className="text-gray-400">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {VARIANT_IMAGE_SLOTS.map(sl => (
                        <Slot key={sl.key} slotKey={`variant_${safe}_${sl.key}`} label={sl.label} required={sl.required}
                          preview={state.imagePreviews[`variant_${safe}_${sl.key}`]} onUpload={up} onRemove={rm} />
                      ))}
                    </div>
                    <textarea rows={2} value={state.variantNotes[color] || ""}
                      onChange={e => dispatch({ type: "SET_VARIANT_NOTE", color, note: e.target.value })}
                      placeholder={`Notes for ${color}…`}
                      className="w-full mt-3 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mixed */}
      {state.imageStrategy === "mixed" && (
        <div className="space-y-5 mb-5">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2.5">General Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GENERAL_IMAGE_SLOTS.slice(0, 4).map(sl => (
                <Slot key={sl.key} slotKey={`mixed_general_${sl.key}`} label={sl.label} required={sl.required}
                  preview={state.imagePreviews[`mixed_general_${sl.key}`]} onUpload={up} onRemove={rm} />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Variant-Specific (optional)</h4>
            {uniqueColors.map(color => {
              const safe = color.replace(/\s/g, "_");
              return (
                <div key={color} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl mb-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${getColorTw(color)} shrink-0 mt-1`} />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {VARIANT_IMAGE_SLOTS.slice(0, 2).map(sl => (
                      <Slot key={sl.key} slotKey={`mixed_variant_${safe}_${sl.key}`} label={`${color} ${sl.label}`} required={false}
                        preview={state.imagePreviews[`mixed_variant_${safe}_${sl.key}`]} onUpload={up} onRemove={rm} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <label className="block text-sm font-bold text-gray-900 mb-1.5">📝 Product Notes</label>
        <textarea rows={3} value={state.productNotes} onChange={e => dispatch({ type: "SET_PRODUCT_NOTES", payload: e.target.value })}
          placeholder="Care instructions, special notes…"
          className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm resize-none" />
      </div>

      <WizardNav onBack={goBack} onNext={handleNext} nextLabel="Continue to SKU" />
    </WizardShell>
  );
}
