// app/seller/products/new/step-7/page.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { FiCheck, FiX, FiHash, FiPackage, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function Step7Page() {
  const { state, dispatch, storeContext, goBack, resetWizard, exitWizard } = useWizard();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const inputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  // Auto-focus the scan input
  useEffect(() => {
    if (!state.isVerified) inputRef.current?.focus();
  }, [state.isVerified]);

  const handleVerify = async () => {
    setMismatch(false);
    const scanned = state.scannedSku.trim();

    if (!scanned) {
      toastError("Please scan or enter the SKU");
      return;
    }

    if (scanned !== state.baseSku) {
      setMismatch(true);
      return;
    }

    // ── Save to Supabase ─────────────────────────────────────
    setSaving(true);
    try {
      // Build FormData with images + wizard data
      const formData = new FormData();

      // Add wizard state as JSON
      const wizardData = {
        storeId: storeContext.id,
        storeSlug: storeContext.slug,
        category: state.category,
        subcategory: state.subcategory,
        productName: state.productName,
        brand: state.brand,
        material: state.material,
        description: state.description,
        gender: state.gender,
        ageGroup: state.ageGroup,
        variants: state.variants,
        imageStrategy: state.imageStrategy,
        variantNotes: state.variantNotes,
        productNotes: state.productNotes,
        baseSku: state.baseSku,
        variantSkus: state.variantSkus,
        printCompleted: state.printCompleted,
        printType: state.printType,
        printCopies: state.printCopies,
        scannedSku: scanned,
      };
      formData.append("wizard_data", JSON.stringify(wizardData));

      // Add image files
      Object.entries(state.images).forEach(([key, file]) => {
        if (file instanceof File) {
          formData.append(key, file);
        }
      });

      const res = await fetch("/api/seller/products/create", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save product");
      }

      dispatch({ type: "SET_VERIFIED" });
      toastSuccess("Product registered successfully!");

    } catch (err) {
      console.error("Save error:", err);
      toastError(err.message || "Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── SUCCESS STATE ──────────────────────────────────────────
  if (state.isVerified) {
    return (
      <WizardShell title="Registration Complete" subtitle="">
        <div className="max-w-md mx-auto text-center py-6">
          {/* Animated checkmark */}
          <div className="w-20 h-20 rounded-full bg-[#2E5C45] mx-auto mb-6 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <FiCheck className="w-10 h-10 text-white" strokeWidth={3} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Registered!
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Your product has been verified and is now live on the marketplace.
          </p>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { label: "Product SKU", value: state.baseSku, mono: true },
              { label: "Store", value: storeContext?.name || "—" },
              { label: "Variants", value: state.variantSkus.length },
              { label: "Status", value: "VERIFIED", highlight: true },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                <p className={`text-sm font-bold truncate ${
                  item.highlight ? "text-[#2E5C45]" : item.mono ? "font-mono text-gray-900" : "text-gray-900"
                }`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={resetWizard}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                         bg-[#2E5C45] text-white font-bold text-sm
                         hover:bg-[#254a38] shadow-[0_4px_14px_rgba(46,92,69,0.3)]
                         transition-all">
              <FiPackage className="w-4 h-4" />
              Register Another
            </button>
            <button type="button" onClick={() => router.push("/seller/products")}
              className="flex-1 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── VERIFICATION STATE ─────────────────────────────────────
  return (
    <WizardShell
      title="Verify Registration"
      subtitle="Scan or type the printed barcode to complete registration"
    >
      <div className="max-w-md mx-auto">
        {/* Scanner area */}
        <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <FiHash className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to Scan</h3>
          <p className="text-sm text-gray-500 mb-6">
            Use your barcode scanner or type the SKU manually
          </p>

          <input
            ref={inputRef}
            type="text"
            value={state.scannedSku}
            onChange={(e) => {
              dispatch({ type: "SET_SCANNED_SKU", payload: e.target.value });
              setMismatch(false);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
            placeholder="Scan or type SKU here…"
            className={`w-full px-4 py-4 rounded-xl border-2 text-center text-sm font-mono font-semibold
                       transition-all focus:ring-2 focus:ring-[#2E5C45]/20
                       ${mismatch
                         ? "border-red-300 bg-red-50/50 text-red-700 focus:border-red-400"
                         : "border-gray-200 text-gray-900 focus:border-[#2E5C45]"
                       }`}
          />

          {/* Mismatch error */}
          {mismatch && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-red-700 mb-1">SKU Mismatch</p>
                  <p className="text-red-600">
                    Scanned: <span className="font-mono font-bold">{state.scannedSku.trim()}</span>
                  </p>
                  <p className="text-red-600">
                    Expected: <span className="font-mono font-bold">{state.baseSku}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expected SKU hint */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Expected:</span>
            <code className="font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-600">{state.baseSku}</code>
          </div>
        </div>

        {/* Verify button */}
        <button type="button" onClick={handleVerify} disabled={saving || !state.scannedSku.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     bg-[#2E5C45] text-white font-bold text-sm
                     hover:bg-[#254a38] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-[0_4px_14px_rgba(46,92,69,0.35)]
                     transition-all">
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving to database…
            </>
          ) : (
            <>
              <FiCheck className="w-5 h-5" />
              Verify & Complete Registration
            </>
          )}
        </button>
      </div>

      <WizardNav
        onBack={goBack}
        showBack={true}
        onNext={null}
      />
    </WizardShell>
  );
}
