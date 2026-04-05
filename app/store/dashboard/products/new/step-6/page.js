// app/store/dashboard/products/new/step-5/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuPrefix, buildVariantSku, getColorTw } from "@/lib/product-wizard-constants";
import { createClient } from "@/utils/supabase/client";

function slugify(t) { return (t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function Step5() {
  const { state, dispatch, storeContext, goNext, goBack } = useWizard();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const [genError, setGenError] = useState(null);

  const generate = async () => {
    if (!storeContext) {
      console.log("[SKU] storeContext not ready yet, skipping");
      setLoading(false);
      return;
    }
    setLoading(true);
    setGenError(null);
    try {
      const storeSlug = storeContext.slug || storeContext.name || "";
      const productSlug = slugify(state.productName);
      const prefix = buildSkuPrefix(storeSlug, productSlug);
      console.log("[SKU] Generating with prefix:", prefix, "store:", storeSlug, "product:", productSlug);

      // Try to find existing SKUs with this prefix
      let seq = 1;
      try {
        const supabase = createClient();
        const { data, error: queryErr } = await supabase
          .from("products_internal")
          .select("base_sku")
          .like("base_sku", `${prefix}-%`)
          .order("base_sku", { ascending: false })
          .limit(1);

        if (queryErr) {
          // Table might not have base_sku column yet — that's OK, start at 0001
          console.warn("[SKU] Query error (non-fatal, using seq=1):", queryErr.message);
        } else if (data?.length) {
          const last = parseInt(data[0].base_sku.split("-").pop(), 10);
          if (!isNaN(last)) seq = last + 1;
          console.log("[SKU] Found existing, next seq:", seq);
        }
      } catch (dbErr) {
        console.warn("[SKU] DB lookup failed (non-fatal):", dbErr.message);
      }

      const baseSku = `${prefix}-${String(seq).padStart(4, "0")}`;

      // Build variant SKUs from the variants in state
      const validVariants = state.variants.filter(v => v.color && v.size);
      console.log("[SKU] Valid variants:", validVariants.length, "of", state.variants.length);

      const variantSkus = validVariants.map(v => ({
        ...v,
        sku: buildVariantSku(baseSku, v.color, v.size),
      }));

      dispatch({ type: "SET_SKU", baseSku, variantSkus });
      console.log("[SKU] Generated:", baseSku, "with", variantSkus.length, "variant SKUs");
    } catch (err) {
      console.error("[SKU] Generation failed:", err);
      setGenError(err.message || "Failed to generate SKU");
    } finally {
      setLoading(false);
    }
  };

  // Generate when storeContext becomes available
  useEffect(() => {
    if (storeContext) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeContext]);

  const copy = async (sku, k) => {
    try { await navigator.clipboard.writeText(sku); setCopied(k); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  const totalQty = state.variants.reduce((s, v) => s + (v.quantity || 0), 0);

  const downloadCSV = () => {
    const rows = [["Product","Base SKU","Variant SKU","Color","Size","Qty","Price"],
      ...state.variantSkus.map(v => [state.productName, state.baseSku, v.sku, v.color, v.size, v.quantity, v.price])];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `SKU_${state.baseSku}.csv`; a.click();
  };

  return (
    <WizardShell title="Generated SKU" subtitle="Unique product codes for tracking">
      {/* Base SKU */}
      <div className="bg-gradient-to-br from-[#2E5C45]/5 to-emerald-50 border-2 border-[#2E5C45]/20 rounded-2xl p-6 text-center mb-6">
        <p className="text-[10px] font-bold text-[#2E5C45] uppercase tracking-widest mb-2">Base Product SKU</p>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="w-4 h-4 border-2 border-[#2E5C45]/30 border-t-[#2E5C45] rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Generating…</span>
          </div>
        ) : !state.baseSku ? (
          <div className="py-3">
            <p className="text-sm text-gray-500 mb-2">Could not generate SKU automatically.</p>
            <button type="button" onClick={generate}
              className="px-4 py-2 rounded-lg bg-[#2E5C45] text-white text-sm font-semibold hover:bg-[#254a38]">
              Generate Now
            </button>
          </div>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-wider font-mono">{state.baseSku || "—"}</p>
            <div className="flex items-center justify-center gap-[1.5px] my-3 opacity-60">
              {(state.baseSku || "").split("").map((ch, i) => (
                <div key={i} className="bg-gray-800 rounded-[0.5px]" style={{ width: ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 1.5, height: 35 + (ch.charCodeAt(0) % 12) }} />
              ))}
            </div>
          </>
        )}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button type="button" onClick={() => copy(state.baseSku, "base")}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#2E5C45]">
            {copied === "base" ? "✓ Copied" : "Copy"}
          </button>
          <button type="button" onClick={generate} disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] disabled:opacity-50">
            Regenerate
          </button>
        </div>
      </div>

      {/* Variant SKUs */}
      {genError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-4">
          ⚠ {genError}. <button type="button" onClick={generate} className="underline font-semibold">Retry</button>
        </div>
      )}

      {!storeContext && !loading && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 mb-4">
          ⚠ Could not load store context. Make sure your store has a slug or name set.
        </div>
      )}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Variant SKUs ({state.variantSkus.length})</h3>
          <button type="button" onClick={downloadCSV}
            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-[#dbe7e0] text-xs font-semibold text-gray-600 hover:border-[#2E5C45]/30">
            ↓ CSV
          </button>
        </div>
        <div className="rounded-xl border border-[#dbe7e0] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-1 px-3 py-2 bg-gray-50 border-b border-[#dbe7e0] text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <span>Color</span><span>Size</span><span>Qty</span><span>Price</span><span>SKU</span>
          </div>
          <div className="divide-y divide-gray-50">
            {state.variantSkus.map((v, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-1.5 px-3 py-2.5 items-center hover:bg-gray-50/50">
                <div className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${getColorTw(v.color)} shrink-0`} />
                  <span className="text-sm font-medium">{v.color}</span>
                </div>
                <span className="text-sm text-gray-600">{v.size}</span>
                <span className="text-sm text-gray-600">{v.quantity}</span>
                <span className="text-sm font-medium">₦{(v.price || 0).toLocaleString()}</span>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
                  <code className="text-[11px] font-mono text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded truncate flex-1">{v.sku}</code>
                  <button type="button" onClick={() => copy(v.sku, `v${i}`)}
                    className="p-1 rounded text-gray-400 hover:text-[#2E5C45] hover:bg-[#2E5C45]/5 shrink-0 text-xs">
                    {copied === `v${i}` ? "✓" : "⧉"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {[
          { l: "Product", v: state.productName },
          { l: "Category", v: `${state.category} / ${state.subcategory}` },
          { l: "Variants", v: state.variantSkus.length },
          { l: "Total Stock", v: totalQty },
          { l: "Material", v: state.material || "—" },
          { l: "Total SKUs", v: state.variantSkus.length + 1, hl: true },
        ].map(item => (
          <div key={item.l} className="bg-gray-50 rounded-xl p-3.5 border border-[#dbe7e0]">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{item.l}</p>
            <p className={`text-sm font-bold truncate ${item.hl ? "text-[#2E5C45]" : "text-gray-900"}`}>{item.v}</p>
          </div>
        ))}
      </div>

      <WizardNav onBack={goBack} onNext={goNext} nextLabel="Continue to Print" />
    </WizardShell>
  );
}
