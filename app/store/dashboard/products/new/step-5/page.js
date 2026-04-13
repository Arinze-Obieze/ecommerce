"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { getPublishReadiness } from "@/lib/product-wizard-constants";
import { useToast } from "@/contexts/ToastContext";

function fmtNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function Step5() {
  const { state, storeContext, goBack, productsPath, clearDraft, dispatch } = useWizard();
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
  const previewImage =
    state.imagePreviews?.general_front ||
    state.imagePreviews?.mixed_general_front ||
    Object.entries(state.imagePreviews || {}).find(([key]) => key.startsWith("variant_"))?.[1] ||
    Object.entries(state.imagePreviews || {}).find(([key]) => key.startsWith("mixed_variant_"))?.[1] ||
    null;

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
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 aspect-square">
                {previewImage ? (
                  <img src={previewImage} className="w-full h-full object-cover" alt="Front" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900">{state.productName || "Unnamed Product"}</h3>
                <p className="text-sm text-gray-500">{state.material || "Material"} • {state.category || "Category"} / {state.subcategory || "Subcategory"}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#2E5C45]/10 text-[#2E5C45] uppercase tracking-wide">
                    {variants.length} Variant{variants.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 font-mono">{state.baseSku || "N/A"}</span>
                </div>
              </div>
            </div>

            {prices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price Range</p>
                  <p className="text-sm font-bold text-gray-900">
                    {minPrice === maxPrice ? fmtNaira(minPrice) : `${fmtNaira(minPrice)} – ${fmtNaira(maxPrice)}`}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Stock</p>
                  <p className="text-sm font-bold text-gray-900">{totalStock} units</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Bulk Discount Rules</h4>
            {tiers.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {tiers.map((tier) => (
                  <li key={`${tier.minimum_quantity}-${tier.discount_percent}`}>
                    Buy <span className="font-semibold">{tier.minimum_quantity}+</span> → <span className="font-semibold text-[#2E5C45]">{tier.discount_percent}% off</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No bulk discount configured for this product.</p>
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
