// app/seller/products/new/step-3/page.jsx
"use client";
import React, { useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { COLORS_LIST, getSizeOptions, getColorTw } from "@/lib/product-wizard-constants";
import {
  FiPlus, FiTrash2, FiZap, FiChevronDown,
  FiLayers, FiGrid, FiEye, FiCheck, FiX
} from "react-icons/fi";

export default function Step3Page() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [bulkMode, setBulkMode] = useState(null); // "color" | "size" | null
  const [bulkStep, setBulkStep] = useState(1);     // 1 = form, 2 = preview
  const [error, setError] = useState(null);

  // Bulk form state
  const [bulkFixedSize, setBulkFixedSize] = useState("");
  const [bulkFixedColor, setBulkFixedColor] = useState("");
  const [bulkSelectedColors, setBulkSelectedColors] = useState([]);
  const [bulkSelectedSizes, setBulkSelectedSizes] = useState([]);
  const [bulkDefaultQty, setBulkDefaultQty] = useState(10);
  const [bulkDefaultPrice, setBulkDefaultPrice] = useState(5000);
  const [bulkPreviewItems, setBulkPreviewItems] = useState([]);

  const sizes = getSizeOptions(state.category);

  const toggleColor = (name) => {
    setBulkSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };
  const toggleSize = (s) => {
    setBulkSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleBulkPreview = () => {
    let items = [];
    if (bulkMode === "color") {
      if (!bulkFixedSize || bulkSelectedColors.length === 0) return;
      items = bulkSelectedColors.map((c) => ({
        color: c, size: bulkFixedSize, quantity: bulkDefaultQty, price: bulkDefaultPrice,
      }));
    } else {
      if (!bulkFixedColor || bulkSelectedSizes.length === 0) return;
      items = bulkSelectedSizes.map((s) => ({
        color: bulkFixedColor, size: s, quantity: bulkDefaultQty, price: bulkDefaultPrice,
      }));
    }
    setBulkPreviewItems(items);
    setBulkStep(2);
  };

  const handleBulkConfirm = () => {
    dispatch({ type: "SET_VARIANTS", payload: [...state.variants, ...bulkPreviewItems] });
    // Reset bulk state
    setBulkMode(null);
    setBulkStep(1);
    setBulkSelectedColors([]);
    setBulkSelectedSizes([]);
    setBulkFixedSize("");
    setBulkFixedColor("");
    setBulkPreviewItems([]);
  };

  const handleBulkCancel = () => {
    setBulkMode(null);
    setBulkStep(1);
    setBulkPreviewItems([]);
  };

  const updatePreviewItem = (idx, field, value) => {
    setBulkPreviewItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleAddManual = () => {
    dispatch({ type: "ADD_VARIANT", payload: { color: "", size: "", quantity: 1, price: 0 } });
  };

  const handleNext = () => {
    setError(null);
    const valid = state.variants.some(
      (v) => v.color && v.size && v.quantity > 0 && v.price > 0
    );
    if (!valid) {
      setError("Add at least one complete variant with color, size, quantity (>0), and price (>0).");
      return;
    }
    goNext();
  };

  return (
    <WizardShell
      title="Product Variants"
      subtitle="Define sizes, colors, quantities and prices"
    >
      {error && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-6 text-sm text-red-700">
          <FiX className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Bulk Add Section ───────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
          <FiZap className="w-4 h-4 text-[#2E5C45]" /> Quick Bulk Add
        </h3>

        {/* Mode buttons */}
        {!bulkMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setBulkMode("color")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-[#2E5C45]/40 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-[#2E5C45]/10 flex items-center justify-center shrink-0">
                <FiGrid className="w-5 h-5 text-[#2E5C45]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Multiple Colors</p>
                <p className="text-xs text-gray-500">One size, many colors</p>
              </div>
            </button>
            <button type="button" onClick={() => setBulkMode("size")}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-[#2E5C45]/40 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-[#2E5C45]/10 flex items-center justify-center shrink-0">
                <FiLayers className="w-5 h-5 text-[#2E5C45]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Multiple Sizes</p>
                <p className="text-xs text-gray-500">One color, many sizes</p>
              </div>
            </button>
          </div>
        )}

        {/* Bulk form */}
        {bulkMode && bulkStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bulkMode === "color" ? (
                <>
                  {/* Fixed size */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Size (fixed)</label>
                    <div className="relative">
                      <select value={bulkFixedSize} onChange={(e) => setBulkFixedSize(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]">
                        <option value="">Pick size</option>
                        {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* Color checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Colors (select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS_LIST.map((c) => (
                        <button key={c.name} type="button" onClick={() => toggleColor(c.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all
                            ${bulkSelectedColors.includes(c.name)
                              ? "border-[#2E5C45] bg-[#2E5C45]/5 text-[#2E5C45]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          <span className={`w-3 h-3 rounded-full ${c.tw} shrink-0`} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Fixed color */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color (fixed)</label>
                    <div className="relative">
                      <select value={bulkFixedColor} onChange={(e) => setBulkFixedColor(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]">
                        <option value="">Pick color</option>
                        {COLORS_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {/* Size checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sizes (select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button key={s} type="button" onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                            ${bulkSelectedSizes.includes(s)
                              ? "border-[#2E5C45] bg-[#2E5C45]/5 text-[#2E5C45]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Default qty & price */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Default Quantity</label>
                <input type="number" min={1} value={bulkDefaultQty} onChange={(e) => setBulkDefaultQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Default Price (₦)</label>
                <input type="number" min={0} step={100} value={bulkDefaultPrice} onChange={(e) => setBulkDefaultPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleBulkCancel}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleBulkPreview}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E5C45] text-white text-sm font-bold hover:bg-[#254a38] transition-colors">
                <FiEye className="w-4 h-4" /> Preview Variants
              </button>
            </div>
          </div>
        )}

        {/* Bulk preview */}
        {bulkMode && bulkStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">Review & adjust quantities/prices before adding.</p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {bulkPreviewItems.map((item, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full ${getColorTw(item.color)} shrink-0`} />
                    <span className="text-sm font-semibold text-gray-900">{item.color}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{item.size}</span>
                  <input type="number" min={1} value={item.quantity}
                    onChange={(e) => updatePreviewItem(i, "quantity", parseInt(e.target.value) || 1)}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium w-full" />
                  <input type="number" min={0} step={100} value={item.price}
                    onChange={(e) => updatePreviewItem(i, "price", parseInt(e.target.value) || 0)}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-medium w-full" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleBulkCancel}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleBulkConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E5C45] text-white text-sm font-bold hover:bg-[#254a38] transition-colors">
                <FiCheck className="w-4 h-4" /> Add {bulkPreviewItems.length} Variants
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Variants List ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            Current Variants ({state.variants.length})
          </h3>
          <button type="button" onClick={handleAddManual}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2E5C45]/10 text-[#2E5C45] text-xs font-bold hover:bg-[#2E5C45]/20 transition-colors">
            <FiPlus className="w-3.5 h-3.5" /> Add Single
          </button>
        </div>

        {state.variants.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiLayers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No variants added yet</p>
            <p className="text-xs mt-1">Use bulk add or add single variants above</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_40px] gap-3 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Color</span><span>Size</span><span>Qty</span><span>Price (₦)</span><span />
            </div>

            <div className="space-y-2">
              {state.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-[2fr_1.5fr_1fr_1.5fr_40px] gap-2 sm:gap-3 p-3 bg-gray-50 rounded-xl items-center border border-gray-100">
                  {/* Color */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <span className={`w-4 h-4 rounded-full ${getColorTw(v.color)} shrink-0`} />
                    </div>
                    <select value={v.color}
                      onChange={(e) => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { color: e.target.value } })}
                      className="w-full pl-9 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]">
                      <option value="">Color</option>
                      {COLORS_LIST.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Size */}
                  <div className="relative">
                    <select value={v.size}
                      onChange={(e) => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { size: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]">
                      <option value="">Size</option>
                      {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Qty */}
                  <input type="number" min={0} value={v.quantity}
                    onChange={(e) => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { quantity: parseInt(e.target.value) || 0 } })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
                  {/* Price */}
                  <input type="number" min={0} step={100} value={v.price}
                    onChange={(e) => dispatch({ type: "UPDATE_VARIANT", index: i, payload: { price: parseInt(e.target.value) || 0 } })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#2E5C45]/20 focus:border-[#2E5C45]" />
                  {/* Remove */}
                  <button type="button"
                    onClick={() => dispatch({ type: "REMOVE_VARIANT", payload: i })}
                    className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors self-center">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <WizardNav
        onBack={goBack}
        onNext={handleNext}
        nextLabel="Continue to Images"
      />
    </WizardShell>
  );
}
