"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { buildSkuPrefix, buildVariantSku, getColorTw, getPublishReadiness, requiresComplianceForCategory } from "@/lib/product-wizard-constants";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/contexts/ToastContext";

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ReviewAndSubmitStep() {
  const { state, dispatch, storeContext, goBack, resetWizard, productsPath, draftId, clearDraft } = useWizard();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loadingSku, setLoadingSku] = useState(false);
  const [skuError, setSkuError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);

  const publishReadiness = useMemo(() => getPublishReadiness(state), [state]);
  const complianceRequired = requiresComplianceForCategory(state.category);
  const totalQty = state.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
  const imageCount = Object.keys(state.persistedImages || {}).length + Object.keys(state.images || {}).length;
  const specsCount = (state.specifications || []).filter((spec) => String(spec?.key || "").trim() && String(spec?.value || "").trim()).length;

  const generateSku = async () => {
    if (!storeContext) return;
    setLoadingSku(true);
    setSkuError(null);
    try {
      const storeSlug = storeContext.slug || storeContext.name || "";
      const productSlug = slugify(state.productName);
      const prefix = buildSkuPrefix(storeSlug, productSlug);
      let seq = 1;

      try {
        const supabase = createClient();
        const { data, error: queryErr } = await supabase
          .from("products_internal")
          .select("base_sku")
          .like("base_sku", `${prefix}-%`)
          .order("base_sku", { ascending: false })
          .limit(1);

        if (!queryErr && data?.length) {
          const last = parseInt(data[0].base_sku.split("-").pop(), 10);
          if (!Number.isNaN(last)) seq = last + 1;
        }
      } catch {}

      const baseSku = `${prefix}-${String(seq).padStart(4, "0")}`;
      const variantSkus = state.variants
        .filter((variant) => variant.color && variant.size)
        .map((variant) => ({
          ...variant,
          sku: buildVariantSku(baseSku, variant.color, variant.size),
        }));

      dispatch({ type: "SET_SKU", baseSku, variantSkus });
    } catch (err) {
      setSkuError(err.message || "Failed to generate SKU.");
    } finally {
      setLoadingSku(false);
    }
  };

  useEffect(() => {
    if (storeContext && state.variants.length > 0) {
      void generateSku();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeContext, state.productName, state.variants]);

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!publishReadiness.ready) {
      showError("Finish the remaining publish blockers before submitting.");
      return;
    }

    if (!storeContext?.id) {
      showError("Store context is missing. Reload the page and try again.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("wizard_data", JSON.stringify({
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
        specificationSummary: state.specificationSummary,
        specifications: state.specifications,
        baseSku: state.baseSku,
        variantSkus: state.variantSkus,
        persistedImages: state.persistedImages,
        draftId,
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
      }));

      Object.entries(state.images).forEach(([key, file]) => {
        if (file instanceof File) fd.append(key, file);
      });

      const res = await fetch("/api/store/products/create", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Save failed");

      await clearDraft();
      dispatch({ type: "SET_VERIFIED" });
      success("Product created successfully.");
    } catch (err) {
      showError(err.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (state.isVerified) {
    return (
      <WizardShell title="Product Created" subtitle="The product is now registered and ready for the next operational tasks.">
        <div className="max-w-md mx-auto text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#2E5C45] mx-auto mb-5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Product Created</h2>
          <p className="text-sm text-gray-500 mb-6">You can print labels later from the product detail page after creation.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
            {[
              { l: "SKU", v: state.baseSku, mono: true },
              { l: "Store", v: storeContext?.name || "—" },
              { l: "Variants", v: state.variantSkus.length },
              { l: "Operations", v: "Print later", hl: true },
            ].map((item) => (
              <div key={item.l} className="bg-gray-50 rounded-xl p-3.5 border border-[#dbe7e0]">
                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">{item.l}</p>
                <p className={`text-sm font-bold truncate ${item.hl ? "text-[#2E5C45]" : item.mono ? "font-mono text-gray-900" : "text-gray-900"}`}>{item.v}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button type="button" onClick={resetWizard} className="flex-1 px-5 py-2.5 rounded-xl bg-[#2E5C45] text-white font-bold text-sm hover:bg-[#254a38] shadow-sm">
              + Create Another
            </button>
            <button type="button" onClick={() => router.push(productsPath)} className="flex-1 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200">
              View Products
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell title="Review & Submit" subtitle="Review the listing, generate SKUs, and submit a publish-ready product.">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Base SKU</h3>
                <p className="text-xs text-gray-500 mt-1">Generate stable product and variant identifiers before you submit.</p>
              </div>
              <button type="button" onClick={generateSku} disabled={loadingSku} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-[#dbe7e0] text-xs font-semibold text-gray-600 hover:border-[#2E5C45]/30 disabled:opacity-50">
                {loadingSku ? "Generating..." : "Regenerate"}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border-2 border-[#2E5C45]/20 bg-gradient-to-br from-[#2E5C45]/5 to-emerald-50 p-5 text-center">
              <p className="text-[10px] font-bold text-[#2E5C45] uppercase tracking-widest mb-2">Base Product SKU</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-wider font-mono">{state.baseSku || "—"}</p>
              {state.baseSku && (
                <button type="button" onClick={() => copy(state.baseSku, "base")} className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#2E5C45]">
                  {copied === "base" ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {skuError && <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{skuError}</div>}

            <div className="mt-5 rounded-xl border border-[#dbe7e0] overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-1 px-3 py-2 bg-gray-50 border-b border-[#dbe7e0] text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                <span>Color</span><span>Size</span><span>Qty</span><span>Price</span><span>Variant SKU</span>
              </div>
              <div className="divide-y divide-gray-50">
                {state.variantSkus.map((variant, index) => (
                  <div key={index} className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_1.5fr_2.5fr] gap-1.5 px-3 py-2.5 items-center hover:bg-gray-50/50">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${getColorTw(variant.color)} shrink-0`} />
                      <span className="text-sm font-medium">{variant.color}</span>
                    </div>
                    <span className="text-sm text-gray-600">{variant.size}</span>
                    <span className="text-sm text-gray-600">{variant.quantity}</span>
                    <span className="text-sm font-medium">₦{(variant.price || 0).toLocaleString()}</span>
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
                      <code className="text-[11px] font-mono text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded truncate flex-1">{variant.sku}</code>
                      <button type="button" onClick={() => copy(variant.sku, `v${index}`)} className="p-1 rounded text-gray-400 hover:text-[#2E5C45] hover:bg-[#2E5C45]/5 shrink-0 text-xs">
                        {copied === `v${index}` ? "✓" : "⧉"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900">Publish Readiness</h3>
            <p className="text-xs text-gray-500 mt-1">
              {complianceRequired ? "Apparel compliance is enforced at submit time." : "This category has lighter compliance requirements."}
            </p>

            <div className={`mt-4 rounded-xl border p-4 ${publishReadiness.ready ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <p className={`text-sm font-bold ${publishReadiness.ready ? "text-emerald-900" : "text-amber-900"}`}>
                {publishReadiness.ready ? "Ready to Submit" : "Action Needed Before Submit"}
              </p>
              <p className={`mt-1 text-xs ${publishReadiness.ready ? "text-emerald-700" : "text-amber-800"}`}>
                {publishReadiness.ready ? "The product has the required listing, media, variant, and apparel data." : "Review the blockers below and complete them before you publish."}
              </p>
            </div>

            {publishReadiness.blockers.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {publishReadiness.blockers.map((blocker) => (
                  <li key={blocker} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-start gap-2"><span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" /><span>Variants and stock are valid.</span></p>
                <p className="flex items-start gap-2"><span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" /><span>Required media is present.</span></p>
                <p className="flex items-start gap-2"><span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" /><span>Buyer-facing specifications are filled in.</span></p>
                <p className="flex items-start gap-2"><span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" /><span>Compliance data is ready for publish.</span></p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                { l: "Variants", v: state.variants.length },
                { l: "Total Stock", v: totalQty },
                { l: "Media Files", v: imageCount },
                { l: "Specs", v: specsCount || (state.specificationSummary?.trim() ? "Summary" : "0") },
              ].map((item) => (
                <div key={item.l} className="bg-gray-50 rounded-xl p-3.5 border border-[#dbe7e0]">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{item.l}</p>
                  <p className="text-sm font-bold text-gray-900">{item.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-900">Operations happen after creation</p>
              <p className="mt-1 text-xs text-blue-800">Barcode printing is no longer a blocking step. You can create the product now and print labels later from product operations.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
          <h3 className="text-sm font-bold text-gray-900">Listing Summary</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product</p>
              <p className="mt-1 text-sm font-bold text-gray-900">{state.productName}</p>
              <p className="mt-2 text-sm text-gray-600">{state.description}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Specifications Summary</p>
              <p className="mt-1 text-sm text-gray-700">{state.specificationSummary?.trim() || "No summary added."}</p>
            </div>
          </div>
        </div>
      </div>

      <WizardNav onBack={goBack} onNext={handleSubmit} nextLabel={saving ? "Submitting..." : "Submit Product"} nextDisabled={!publishReadiness.ready || saving || loadingSku} nextLoading={saving} />
    </WizardShell>
  );
}
