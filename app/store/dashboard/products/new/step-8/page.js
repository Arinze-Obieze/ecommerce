// app/store/dashboard/products/new/step-8/page.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { useRouter } from "next/navigation";

export default function Step8() {
  const { state, dispatch, storeContext, goBack, resetWizard, productsPath, draftId, clearDraft } = useWizard();
  const router = useRouter();
  const inputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  useEffect(() => { if (!state.isVerified) inputRef.current?.focus(); }, [state.isVerified]);

  const handleVerify = async () => {
    setMismatch(false);
    const scanned = state.scannedSku.trim();
    if (!scanned) return;
    if (scanned !== state.baseSku) { setMismatch(true); return; }
    if (!storeContext?.id) {
      alert("Store context is missing. Reload the page and try again.");
      return;
    }
    if (!state.baseSku) {
      alert("Generate a base SKU before completing verification.");
      return;
    }
    if (!state.variants.length) {
      alert("Add at least one product variant before submitting.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("wizard_data", JSON.stringify({
        // Store
        storeId: storeContext.id,
        storeSlug: storeContext.slug,
        // Step 1 — Category
        category: state.category,
        subcategory: state.subcategory,
        // Step 2 — Basic info
        productName: state.productName,
        brand: state.brand,
        material: state.material,
        description: state.description,
        gender: state.gender,
        ageGroup: state.ageGroup,
        // Step 3 — Label & care
        fiberComposition: state.fiberComposition,
        countryOfOrigin: state.countryOfOrigin,
        countryOfTransformation: state.countryOfTransformation,
        labelBrand: state.labelBrand,
        careWashing: state.careWashing,
        careBleaching: state.careBleaching,
        careDrying: state.careDrying,
        careIroning: state.careIroning,
        careDryCleaning: state.careDryCleaning,
        childrenSafetyFlags: state.childrenSafetyFlags,
        flammabilityFlags: state.flammabilityFlags,
        // Step 4 — Variants
        variants: state.variants,
        // Step 5 — Images
        imageStrategy: state.imageStrategy,
        variantNotes: state.variantNotes,
        productNotes: state.productNotes,
        persistedImages: state.persistedImages,
        // Step 6 — SKU
        baseSku: state.baseSku,
        variantSkus: state.variantSkus,
        // Step 7 — Print
        printCompleted: state.printCompleted,
        printType: state.printType,
        printCopies: state.printCopies,
        // Step 8 — Verify
        scannedSku: scanned,
        draftId,
      }));

      Object.entries(state.images).forEach(([key, file]) => {
        if (file instanceof File) fd.append(key, file);
      });

      const res = await fetch("/api/store/products/create", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Save failed");

      await clearDraft();
      dispatch({ type: "SET_VERIFIED" });
    } catch (err) {
      alert(err.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────
  if (state.isVerified) {
    return (
      <WizardShell title="Registration Complete" subtitle="">
        <div className="max-w-md mx-auto text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#2E5C45] mx-auto mb-5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Product Registered!</h2>
          <p className="text-sm text-gray-500 mb-6">Verified and saved to the marketplace.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
            {[
              { l: "SKU", v: state.baseSku, mono: true },
              { l: "Store", v: storeContext?.name || "—" },
              { l: "Variants", v: state.variantSkus.length },
              { l: "Status", v: "VERIFIED", hl: true },
            ].map(item => (
              <div key={item.l} className="bg-gray-50 rounded-xl p-3.5 border border-[#dbe7e0]">
                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">{item.l}</p>
                <p className={`text-sm font-bold truncate ${item.hl ? "text-[#2E5C45]" : item.mono ? "font-mono text-gray-900" : "text-gray-900"}`}>{item.v}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button type="button" onClick={resetWizard}
              className="flex-1 px-5 py-2.5 rounded-xl bg-[#2E5C45] text-white font-bold text-sm hover:bg-[#254a38] shadow-sm">
              + Register Another
            </button>
            <button type="button" onClick={() => router.push(productsPath)}
              className="flex-1 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">
              View Products
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── VERIFY ─────────────────────────────────────────────────
  return (
    <WizardShell title="Verify Registration" subtitle="Scan or type the barcode to complete">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-6 text-center mb-5">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Ready to Scan</h3>
          <p className="text-xs text-gray-500 mb-4">Use barcode scanner or type manually</p>

          <input
            ref={inputRef}
            type="text"
            value={state.scannedSku}
            onChange={e => { dispatch({ type: "SET_SCANNED_SKU", payload: e.target.value }); setMismatch(false); }}
            onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
            placeholder="Scan or type SKU…"
            className={`w-full px-4 py-3.5 rounded-xl border-2 text-center text-sm font-mono font-semibold transition-all
              ${mismatch
                ? "border-red-300 bg-red-50/50 text-red-700"
                : "border-gray-200 text-gray-900 focus:border-[#2E5C45] focus:ring-2 focus:ring-[#2E5C45]/20"}`}
          />

          {mismatch && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs">
              <p className="font-bold text-red-700 mb-1">SKU Mismatch</p>
              <p className="text-red-600">Scanned: <span className="font-mono font-bold">{state.scannedSku.trim()}</span></p>
              <p className="text-red-600">Expected: <span className="font-mono font-bold">{state.baseSku}</span></p>
            </div>
          )}

          <p className="mt-3 text-[11px] text-gray-400">
            Expected: <code className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">{state.baseSku}</code>
          </p>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={saving || !state.scannedSku.trim()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#2E5C45] text-white font-bold text-sm hover:bg-[#254a38] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : (
            <>✓ Verify & Complete</>
          )}
        </button>
      </div>

      <WizardNav onBack={goBack} showBack={true} onNext={null} />
    </WizardShell>
  );
}