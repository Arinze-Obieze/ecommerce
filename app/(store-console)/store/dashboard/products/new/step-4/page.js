"use client";
import React, { useMemo, useState } from "react";
import { useWizard } from "@/components/product-wizard/WizardProvider";
import WizardShell from "@/components/product-wizard/WizardShell";
import WizardNav from "@/components/product-wizard/WizardNav";
import { normalizeBulkDiscountTiers } from "@/utils/catalog/bulk-pricing";
import { useToast } from "@/contexts/toast/ToastContext";

function createEmptyTier() {
  return { minimum_quantity: "", discount_percent: "" };
}

function fmtNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function Step4() {
  const { state, dispatch, goBack, goNext } = useWizard();
  const { error: showError } = useToast();

  const [tiers, setTiers] = useState(() => {
    if (Array.isArray(state.bulkDiscountTiers) && state.bulkDiscountTiers.length > 0) {
      return state.bulkDiscountTiers.map((tier) => ({
        minimum_quantity: String(tier?.minimum_quantity ?? ""),
        discount_percent: String(tier?.discount_percent ?? ""),
      }));
    }
    return [createEmptyTier()];
  });

  const variantPrices = (state.variants || []).map((variant) => Number(variant.price || 0)).filter((value) => value > 0);
  const referenceUnitPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

  const populatedTiers = useMemo(
    () => tiers.filter((tier) => String(tier?.minimum_quantity || "").trim() || String(tier?.discount_percent || "").trim()),
    [tiers]
  );

  const previewResult = useMemo(() => normalizeBulkDiscountTiers(populatedTiers), [populatedTiers]);

  const updateTier = (index, field, value) => {
    setTiers((current) => current.map((tier, tierIndex) => (tierIndex === index ? { ...tier, [field]: value } : tier)));
  };

  const addTier = () => {
    setTiers((current) => [...current, createEmptyTier()]);
  };

  const removeTier = (index) => {
    setTiers((current) => {
      const next = current.filter((_, tierIndex) => tierIndex !== index);
      return next.length > 0 ? next : [createEmptyTier()];
    });
  };

  const handleNext = () => {
    const hasIncompleteTier = tiers.some((tier) => {
      const minimum = String(tier?.minimum_quantity || "").trim();
      const discount = String(tier?.discount_percent || "").trim();
      return (minimum && !discount) || (!minimum && discount);
    });

    if (hasIncompleteTier) {
      showError("Each discount tier must include both minimum quantity and discount percent.");
      return;
    }

    const result = normalizeBulkDiscountTiers(populatedTiers);
    if (result.error) {
      showError(result.error);
      return;
    }

    dispatch({ type: "SET_BASIC_INFO", payload: { bulkDiscountTiers: result.value || [] } });
    goNext();
  };

  return (
    <WizardShell
      title="Bulk Discounts"
      subtitle="Optional: reward larger orders with automatic quantity-based discounts."
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#E8E4DC] bg-[#f8fbf9] p-4">
          <p className="text-sm font-bold text-gray-900">How this works</p>
          <p className="mt-1 text-sm text-gray-600">
            Buyers automatically get a lower unit price when quantity reaches a tier. Example: buy 10+, get 8% off.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Leave all rows empty if you do not want bulk discounts on this product.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3.5 xl:col-span-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">Discount Tiers</h3>
              <button
                type="button"
                onClick={addTier}
                className="px-3 py-2 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                + Add Tier
              </button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-semibold mb-1">Minimum quantity</label>
                    <input
                      type="number"
                      min="2"
                      value={tier.minimum_quantity}
                      onChange={(event) => updateTier(index, "minimum_quantity", event.target.value)}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-semibold mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0.01"
                      max="99.99"
                      step="0.01"
                      value={tier.discount_percent}
                      onChange={(event) => updateTier(index, "discount_percent", event.target.value)}
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="sm:mt-6 px-2.5 py-2 rounded-lg text-xs font-semibold text-gray-500 border border-gray-200 hover:text-red-600 hover:border-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {previewResult.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {previewResult.error}
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm xl:col-span-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Preview</h3>
            {!previewResult.value || previewResult.value.length === 0 ? (
              <p className="text-sm text-gray-500">No bulk discounts configured. Buyers pay the normal unit price.</p>
            ) : (
              <div className="space-y-2">
                {previewResult.value.map((tier) => {
                  const discounted = referenceUnitPrice > 0
                    ? Math.max(0, referenceUnitPrice * (1 - tier.discount_percent / 100))
                    : 0;

                  return (
                    <div key={`${tier.minimum_quantity}-${tier.discount_percent}`} className="rounded-xl border border-[#E8E4DC] px-3 py-2.5 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-800">Buy {tier.minimum_quantity}+ units</p>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2E6417]">{tier.discount_percent}% off</p>
                        {referenceUnitPrice > 0 ? (
                          <p className="text-xs text-gray-500">Unit: {fmtNaira(referenceUnitPrice)} → {fmtNaira(discounted)}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Add variant pricing to see currency preview.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <WizardNav
        showBack={true}
        showCancel={false}
        onBack={goBack}
        onNext={handleNext}
        nextLabel="Continue to Review"
      />
    </WizardShell>
  );
}
