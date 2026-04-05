// app/store/dashboard/products/new/step-3/page.js
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { COLORS_LIST, getSizeOptions, getColorTw } from "@/lib/product-wizard-constants";

export default function Step3() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [bulkMode, setBulkMode] = useState(null);
  const [bulkStep, setBulkStep] = useState(1);
  const [error, setError] = useState(null);
  const [bf, setBf] = useState({ size: "", color: "", colors: [], sizes: [], qty: 10, price: 5000 });
  const [preview, setPreview] = useState([]);

  const sizes = getSizeOptions(state.category);

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  const keyForVariant = (variant) => `${variant.color?.trim().toLowerCase() || ""}__${variant.size?.trim().toLowerCase() || ""}`;

  const findDuplicateKeys = (variants) => {
    const seen = new Set();
    const duplicates = new Set();

    variants.forEach((variant) => {
      const key = keyForVariant(variant);
      if (!key || key === "__") return;
      if (seen.has(key)) duplicates.add(key);
      seen.add(key);
    });

    return duplicates;
  };

  const doPreview = () => {
    setError(null);
    let items = [];
    if (bulkMode === "color") {
      if (!bf.size || !bf.colors.length) return;
      items = bf.colors.map(c => ({ color: c, size: bf.size, quantity: bf.qty, price: bf.price }));
    } else {
      if (!bf.color || !bf.sizes.length) return;
      items = bf.sizes.map(s => ({ color: bf.color, size: s, quantity: bf.qty, price: bf.price }));
    }
    setPreview(items);
    setBulkStep(2);
  };

  const doConfirm = () => {
    const merged = [...state.variants, ...preview];
    if (findDuplicateKeys(merged).size > 0) {
      setError("Duplicate color and size combinations are not allowed.");
      return;
    }
    dispatch({ type: "SET_VARIANTS", payload: [...state.variants, ...preview] });
    setBulkMode(null); setBulkStep(1); setPreview([]);
    setBf({ size: "", color: "", colors: [], sizes: [], qty: 10, price: 5000 });
  };

  const doCancel = () => { setBulkMode(null); setBulkStep(1); setPreview([]); };

  const handleNext = () => {
    setError(null);
    if (state.variants.length === 0) {
      setError("Add at least one variant before continuing.");
      return;
    }
    if (state.variants.some(v => !v.color || !v.size || v.quantity <= 0 || v.price <= 0)) {
      setError("Complete every variant with color, size, qty > 0, and price > 0.");
      return;
    }
    if (findDuplicateKeys(state.variants).size > 0) {
      setError("Each color and size combination must be unique.");
      return;
    }
    goNext();
  };

  return (
    <WizardShell title="Product Variants" subtitle="Define sizes, colors, quantities and prices">
      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-5">{error}</div>}

      {/* Bulk Add */}
      <div className="bg-gray-50 border border-[#dbe7e0] rounded-2xl p-4 sm:p-5 mb-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">⚡ Quick Bulk Add</h3>

        {!bulkMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setBulkMode("color")}
              className="p-4 rounded-xl border-2 border-dashed border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40 transition-all text-left">
              <p className="text-sm font-bold text-gray-900">Multiple Colors</p>
              <p className="text-xs text-gray-500">One size, many colors</p>
            </button>
            <button type="button" onClick={() => setBulkMode("size")}
              className="p-4 rounded-xl border-2 border-dashed border-[#dbe7e0] bg-white hover:border-[#2E5C45]/40 transition-all text-left">
              <p className="text-sm font-bold text-gray-900">Multiple Sizes</p>
              <p className="text-xs text-gray-500">One color, many sizes</p>
            </button>
          </div>
        )}

        {bulkMode && bulkStep === 1 && (
          <div className="bg-white rounded-xl border border-[#dbe7e0] p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bulkMode === "color" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fixed Size</label>
                    <select value={bf.size} onChange={e => setBf({ ...bf, size: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      <option value="">Pick size</option>
                      {sizes.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Colors</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLORS_LIST.map(c => (
                        <button key={c.name} type="button" onClick={() => setBf({ ...bf, colors: toggleArr(bf.colors, c.name) })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold
                            ${bf.colors.includes(c.name) ? "border-[#2E5C45] bg-[#2E5C45]/5 text-[#2E5C45]" : "border-gray-200 text-gray-600"}`}>
                          <span className={`w-3 h-3 rounded-full ${c.tw} shrink-0`} />{c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fixed Color</label>
                    <select value={bf.color} onChange={e => setBf({ ...bf, color: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                      <option value="">Pick color</option>
                      {COLORS_LIST.map(c => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sizes</label>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map(s => (
                        <button key={s} type="button" onClick={() => setBf({ ...bf, sizes: toggleArr(bf.sizes, s) })}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold
                            ${bf.sizes.includes(s) ? "border-[#2E5C45] bg-[#2E5C45]/5 text-[#2E5C45]" : "border-gray-200 text-gray-600"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Default Qty</label>
                <input type="number" min={1} value={bf.qty} onChange={e => setBf({ ...bf, qty: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Default Price (₦)</label>
                <input type="number" min={0} step={100} value={bf.price} onChange={e => setBf({ ...bf, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={doCancel} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={doPreview} className="flex-1 px-3 py-2 rounded-lg bg-[#2E5C45] text-white text-sm font-bold hover:bg-[#254a38]">Preview</button>
            </div>
          </div>
        )}

        {bulkMode && bulkStep === 2 && (
          <div className="bg-white rounded-xl border border-[#dbe7e0] p-4 space-y-3">
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Adjust qty/price per row before adding.</p>
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {preview.map((item, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-gray-50 rounded-lg items-center">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full ${getColorTw(item.color)} shrink-0`} />
                    <span className="text-sm font-semibold">{item.color}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.size}</span>
                  <input type="number" min={1} value={item.quantity}
                    onChange={e => setPreview(p => p.map((x, j) => j === i ? { ...x, quantity: parseInt(e.target.value) || 1 } : x))}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm w-full" />
                  <input type="number" min={0} step={100} value={item.price}
                    onChange={e => setPreview(p => p.map((x, j) => j === i ? { ...x, price: parseInt(e.target.value) || 0 } : x))}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm w-full" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={doCancel} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-500">Cancel</button>
              <button type="button" onClick={doConfirm} className="flex-1 px-3 py-2 rounded-lg bg-[#2E5C45] text-white text-sm font-bold">Add {preview.length} Variants</button>
            </div>
          </div>
        )}
      </div>

      {/* Variant list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Variants ({state.variants.length})</h3>
        <button type="button" onClick={() => dispatch({ type: "ADD_VARIANT", payload: { color: "", size: "", quantity: 1, price: 0 } })}
          className="px-3 py-1.5 rounded-lg bg-[#2E5C45]/10 text-[#2E5C45] text-xs font-bold hover:bg-[#2E5C45]/20">+ Add Single</button>
      </div>

      {state.variants.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No variants yet. Use bulk add or add singles.</div>
      ) : (
        <div className="space-y-2">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_36px] gap-2 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>Color</span><span>Size</span><span>Qty</span><span>Price (₦)</span><span />
          </div>
          {state.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[2fr_1.5fr_1fr_1.5fr_36px] gap-2 p-2.5 bg-gray-50 rounded-xl border border-[#dbe7e0] items-center">
              <div className="relative">
                <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${getColorTw(v.color)} pointer-events-none`} />
                <select value={v.color} onChange={e => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { color: e.target.value } })}
                  className="w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-medium">
                  <option value="">Color</option>
                  {COLORS_LIST.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <select value={v.size} onChange={e => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { size: e.target.value } })}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm font-medium">
                <option value="">Size</option>
                {sizes.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="number" min={0} value={v.quantity} onChange={e => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { quantity: parseInt(e.target.value) || 0 } })}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm" />
              <input type="number" min={0} step={100} value={v.price} onChange={e => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { price: parseInt(e.target.value) || 0 } })}
                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm" />
              <button type="button" onClick={() => dispatch({ type: "REMOVE_VARIANT", payload: i })}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <WizardNav onBack={goBack} onNext={handleNext} nextLabel="Continue to Images" />
    </WizardShell>
  );
}
