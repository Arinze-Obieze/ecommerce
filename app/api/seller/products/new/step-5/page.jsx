// app/seller/products/new/step-5/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuPrefix, buildSkuCode, buildVariantSku, getColorTw } from "@/lib/product-wizard-constants";
import { FiCopy, FiRefreshCw, FiDownload, FiCheck, FiHash } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";

function slugify(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Step5Page() {
  const { state, dispatch, storeContext, goNext, goBack } = useWizard();
  const [loading, setLoading] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  // Generate SKU on mount or when regenerate is clicked
  const generateSku = async () => {
    if (!storeContext) return;
    setLoading(true);

    try {
      const storeSlug = storeContext.slug || storeContext.name;
      const productSlug = slugify(state.productName);
      const prefix = buildSkuPrefix(storeSlug, productSlug);

      // Query Supabase for existing SKUs with this prefix
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products_internal")
        .select("base_sku")
        .like("base_sku", `${prefix}-%`)
        .order("base_sku", { ascending: false })
        .limit(1);

      let seq = 1;
      if (!error && data && data.length > 0) {
        const lastSku = data[0].base_sku;
        const lastSeq = parseInt(lastSku.split("-").pop(), 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
      }

      const seqStr = String(seq).padStart(4, "0");
      const baseSku = `${prefix}-${seqStr}`;

      // Build variant SKUs
      const variantSkus = state.variants
        .filter((v) => v.color && v.size)
        .map((v) => ({
          ...v,
          sku: buildVariantSku(baseSku, v.color, v.size),
        }));

      dispatch({ type: "SET_SKU", baseSku, variantSkus });
    } catch (err) {
      console.error("SKU generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!state.baseSku) {
      generateSku();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async (sku, key) => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(key);
      setTimeout(() => setCopiedSku(null), 2000);
    } catch { /* ignore */ }
  };

  const totalQuantity = state.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
  const avgPrice = state.variants.length > 0
    ? Math.round(state.variants.reduce((sum, v) => sum + (v.price || 0), 0) / state.variants.length)
    : 0;

  const handleDownloadCSV = () => {
    const rows = [
      ["Product Name", "Base SKU", "Variant SKU", "Color", "Size", "Quantity", "Price"],
      ...state.variantSkus.map((v) => [
        state.productName, state.baseSku, v.sku, v.color, v.size, v.quantity, v.price,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SKU_List_${state.baseSku}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WizardShell
      title="Generated SKU"
      subtitle="Unique product codes for inventory tracking"
    >
      {/* ── Base SKU Display ──────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#2E5C45]/5 to-emerald-50 border-2 border-[#2E5C45]/20 rounded-2xl p-6 sm:p-8 text-center mb-8">
        <p className="text-xs font-bold text-[#2E5C45] uppercase tracking-widest mb-3">Base Product SKU</p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-5 h-5 border-2 border-[#2E5C45]/30 border-t-[#2E5C45] rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Generating…</span>
          </div>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-wider font-mono mb-1">
              {state.baseSku || "—"}
            </p>
            {/* Barcode-style visual */}
            <div className="flex items-center justify-center gap-[2px] my-4 opacity-70">
              {(state.baseSku || "").split("").map((char, i) => (
                <div key={i}
                  className="bg-gray-800 rounded-sm"
                  style={{
                    width: char === "-" ? 1 : (char.charCodeAt(0) % 3) + 2,
                    height: 40 + (char.charCodeAt(0) % 10),
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-3 mt-4">
          <button type="button" onClick={() => handleCopy(state.baseSku, "base")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] hover:text-[#2E5C45] transition-all">
            {copiedSku === "base" ? <><FiCheck className="w-3.5 h-3.5 text-[#2E5C45]" /> Copied!</> : <><FiCopy className="w-3.5 h-3.5" /> Copy</>}
          </button>
          <button type="button" onClick={generateSku} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#2E5C45] hover:text-[#2E5C45] transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
          </button>
        </div>
      </div>

      {/* ── Variant SKUs Table ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            Variant SKUs ({state.variantSkus.length})
          </h3>
          <button type="button" onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600 hover:border-[#2E5C45]/30 hover:text-[#2E5C45] transition-all">
            <FiDownload className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Color</span><span>Size</span><span>Qty</span><span>Price</span><span>SKU</span>
          </div>

          <div className="divide-y divide-gray-50">
            {state.variantSkus.map((v, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-2 sm:gap-2 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${getColorTw(v.color)} shrink-0`} />
                  <span className="text-sm font-medium text-gray-900">{v.color}</span>
                </div>
                <span className="text-sm text-gray-600">{v.size}</span>
                <span className="text-sm text-gray-600">{v.quantity}</span>
                <span className="text-sm font-medium text-gray-900">₦{(v.price || 0).toLocaleString()}</span>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded truncate flex-1">
                    {v.sku}
                  </code>
                  <button type="button" onClick={() => handleCopy(v.sku, `v-${i}`)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#2E5C45] hover:bg-[#2E5C45]/5 transition-colors shrink-0">
                    {copiedSku === `v-${i}` ? <FiCheck className="w-3.5 h-3.5 text-[#2E5C45]" /> : <FiCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Summary ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
        {[
          { label: "Product", value: state.productName },
          { label: "Category", value: `${state.category} / ${state.subcategory}` },
          { label: "Variants", value: state.variantSkus.length },
          { label: "Total Stock", value: totalQuantity },
          { label: "Material", value: state.material || "—" },
          { label: "Total SKUs", value: state.variantSkus.length + 1, highlight: true },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className={`text-sm font-bold truncate ${item.highlight ? "text-[#2E5C45]" : "text-gray-900"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <WizardNav
        onBack={goBack}
        onNext={goNext}
        nextLabel="Continue to Print"
      />
    </WizardShell>
  );
}
