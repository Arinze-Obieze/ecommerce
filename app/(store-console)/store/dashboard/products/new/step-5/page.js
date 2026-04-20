"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { getPublishReadiness } from "@/features/product-wizard/lib/constants";
import { useToast } from "@/contexts/toast/ToastContext";

function fmtNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function Step5() {
  const { state, storeContext, goBack, goToStep, productsPath, clearDraft, dispatch } = useWizard();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readiness = useMemo(() => getPublishReadiness(state), [state]);

  const variants = state.variants || [];
  const prices = variants.map((variant) => Number(variant.price || 0)).filter((price) => price > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const totalStock = variants.reduce((sum, variant) => sum + (Number.parseInt(variant.quantity, 10) || 0), 0);
  const tiers = Array.isArray(state.bulkDiscountTiers) ? state.bulkDiscountTiers : [];
  const productImageCount = Object.keys({ ...(state.images || {}), ...(state.persistedImages || {}) }).filter((key) => key.startsWith("general_")).length;
  const previewImage =
    state.imagePreviews?.general_front ||
    state.imagePreviews?.mixed_general_front ||
    Object.entries(state.imagePreviews || {}).find(([key]) => key.startsWith("variant_"))?.[1] ||
    Object.entries(state.imagePreviews || {}).find(([key]) => key.startsWith("mixed_variant_"))?.[1] ||
    null;
  const getBaseUrl = () => {
    const configured = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
    if (configured) {
      const normalized = configured.replace(/\/+$/, "");
      if (/^https?:\/\//i.test(normalized)) return normalized;
      return `https://${normalized}`;
    }
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };
  const inventoryQrValue = useMemo(
    () => {
      const code = String(state.baseSku || "").trim();
      if (!code) return "";
      const baseUrl = getBaseUrl();
      return baseUrl
        ? `${baseUrl}/qr/p/${encodeURIComponent(code)}`
        : `/qr/p/${encodeURIComponent(code)}`;
    },
    [state.baseSku],
  );
  const inventoryQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=png&margin=12&data=${encodeURIComponent(inventoryQrValue)}`;

  const openInventoryQrPng = () => {
    window.open(inventoryQrImageUrl, "_blank", "noopener,noreferrer");
  };

  const downloadInventoryQrPng = async () => {
    try {
      const response = await fetch(inventoryQrImageUrl);
      if (!response.ok) throw new Error("Failed to download QR image");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeSku = (state.baseSku || state.productName || "product")
        .toString()
        .replace(/[^a-zA-Z0-9_-]+/g, "-");
      link.href = objectUrl;
      link.download = `${safeSku}-inventory-qr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      showSuccess("QR image downloaded.");
    } catch {
      showError("Could not download QR image.");
    }
  };

  const printInventoryQr = () => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=560");
    if (!w) return;
    const name = (state.productName || "Product").replace(/</g, "&lt;");
    const sku = (state.baseSku || "No SKU").replace(/</g, "&lt;");
    const value = inventoryQrValue.replace(/</g, "&lt;");
    w.document.write(
      `<html><head><title>Print Inventory QR</title><style>body{font-family:Arial,sans-serif;margin:0;padding:24px;text-align:center;color:#111}.card{border:1px solid #ddd;border-radius:12px;padding:16px;max-width:340px;margin:0 auto}img{width:240px;height:240px;display:block;margin:0 auto 12px}h2{font-size:16px;margin:0 0 8px}p{margin:4px 0;font-size:12px;color:#555;word-break:break-all}</style></head><body><div class="card"><img src="${inventoryQrImageUrl}" alt="Inventory QR"/><h2>${name}</h2><p>SKU: ${sku}</p><p>${value}</p></div><script>window.onload=()=>window.print()</script></body></html>`
    );
    w.document.close();
  };

  const handleSubmit = async () => {
    if (!readiness.ready) {
      showError("Please resolve all blockers before publishing.");
      return;
    }

    if (!storeContext?.id) {
      showError("Store context is missing. Reload and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      const payload = {
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
        moodTags: state.moodTags || [],
        variants: state.variants,
        imageStrategy: state.imageStrategy,
        variantNotes: state.variantNotes,
        productNotes: state.productNotes,
        specificationSummary: state.specificationSummary,
        specifications: state.specifications,
        baseSku: state.baseSku,
        variantSkus: state.variantSkus,
        persistedImages: state.persistedImages,
        bulkDiscountTiers: state.bulkDiscountTiers,
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
      };

      formData.append("wizard_data", JSON.stringify(payload));

      Object.entries(state.images || {}).forEach(([key, file]) => {
        if (file instanceof File) formData.append(key, file);
      });

      const response = await fetch("/api/store/products/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      await clearDraft();
      dispatch({ type: "SET_VERIFIED" });
      showSuccess("Product published successfully!");
      router.push(productsPath || "/store/dashboard/products");
    } catch (error) {
      showError(error.message || "An unexpected error occurred during publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardShell title="Review & Publish" subtitle="Final check before listing this product in your store.">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 aspect-square">
                  {previewImage ? (
                    <img src={previewImage} className="w-full h-full object-cover" alt="Front" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{state.productName || "Unnamed Product"}</h3>
                  <p className="text-sm text-gray-500">{state.category || "Category"} / {state.subcategory || "Subcategory"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <p>Gender: <span className="font-semibold text-gray-800">{state.gender || "—"}</span></p>
              <p>Age Group: <span className="font-semibold text-gray-800">{state.ageGroup || "—"}</span></p>
              <p>Brand: <span className="font-semibold text-gray-800">{state.brand || "—"}</span></p>
              <p>Description: <span className="font-semibold text-gray-800">{state.description ? `${state.description.slice(0, 80)}${state.description.length > 80 ? "..." : ""}` : "—"}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-gray-900">Step 2: Variants, Pricing & Media</h4>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Variants</p>
                <p className="text-sm font-bold text-gray-900">{variants.length}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Base SKU</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{state.baseSku || "N/A"}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price Range</p>
                <p className="text-sm font-bold text-gray-900">
                  {prices.length ? (minPrice === maxPrice ? fmtNaira(minPrice) : `${fmtNaira(minPrice)} – ${fmtNaira(maxPrice)}`) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Stock</p>
                <p className="text-sm font-bold text-gray-900">{totalStock} units</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-600">Product media uploaded: <span className="font-semibold text-gray-800">{productImageCount}</span> (minimum 2 required)</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-gray-900">Step 3: Compliance & Care (Optional)</h4>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <p>Country of Origin: <span className="font-semibold text-gray-800">{state.countryOfOrigin || "—"}</span></p>
              <p>Country of Transformation: <span className="font-semibold text-gray-800">{state.countryOfTransformation || "—"}</span></p>
              <p>Care (Wash/Bleach/Dry/Iron): <span className="font-semibold text-gray-800">{[state.careWashing, state.careBleaching, state.careDrying, state.careIroning].filter(Boolean).length ? "Configured" : "—"}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-gray-900">Step 4: Bulk Discounts</h4>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
            {tiers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {tiers.map((tier) => (
                  <li key={`${tier.minimum_quantity}-${tier.discount_percent}`}>
                    Buy <span className="font-semibold">{tier.minimum_quantity}+</span> → <span className="font-semibold text-[#2E6417]">{tier.discount_percent}% off</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No bulk discount configured for this product.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-4 xl:sticky xl:top-24">
          {!readiness.ready ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
              <h4 className="text-sm font-bold text-amber-900">Publishing Blockers</h4>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-sm text-amber-800 font-medium">
                {readiness.blockers.map((blocker, index) => (
                  <li key={`${blocker}-${index}`}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50">
              <h4 className="text-sm font-bold text-green-900">Ready to Publish</h4>
              <p className="text-xs text-green-700 mt-1">All required information has been filled correctly.</p>
            </div>
          )}
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Final Check</p>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>{variants.length} variant entries prepared</li>
              <li>{tiers.length > 0 ? `${tiers.length} discount tier${tiers.length > 1 ? "s" : ""}` : "No discount tiers"}</li>
              <li>{prices.length > 0 ? "Pricing included" : "Missing variant pricing"}</li>
            </ul>
          </div>
          <div className="mt-3 rounded-xl border border-[#E8E4DC] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Inventory QR Preview</p>
            <p className="mt-1 text-xs text-gray-600">
              Encodes a URL resolver so scanner apps open a link instead of raw text.
            </p>
            <img
              src={inventoryQrImageUrl}
              alt="Inventory QR preview"
              className="mt-3 h-36 w-36 rounded-lg border border-gray-200 bg-white p-1"
            />
            <p className="mt-2 break-all text-[11px] text-gray-500">{inventoryQrValue}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openInventoryQrPng}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open PNG
              </button>
              <button
                type="button"
                onClick={downloadInventoryQrPng}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={printInventoryQr}
                className="rounded-lg border border-[#2E6417] px-3 py-1.5 text-xs font-semibold text-[#2E6417] hover:bg-[#EDF5E6]"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <WizardNav
        showBack={true}
        showCancel={false}
        onBack={goBack}
        onNext={handleSubmit}
        nextLabel="Publish Product"
        nextLoading={isSubmitting}
        nextDisabled={!readiness.ready || isSubmitting}
      />
    </WizardShell>
  );
}
