"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  createEmptyBulkTier,
  createEmptySpecification,
} from "@/features/store-console/products/editor/productDetailEditor.utils";

export default function ProductDetailsStep({
  form,
  setForm,
  updateSpecification,
  updateBulkDiscountTier,
  goToStep,
}) {
  return (
    <div className="space-y-6">
      <div className="zova-store-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-(--zova-text-strong)">Specifications</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                specifications: [...current.specifications, createEmptySpecification()],
              }))
            }
            className="zova-store-toolbar-btn is-primary"
          >
            Add spec
          </button>
        </div>
        <p className="mt-1 text-sm text-(--zova-text-muted)">Material, size, features, and care notes.</p>

        <div className="mt-6 space-y-3">
          {form.specifications.map((spec, index) => (
            <div key={`spec-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <input
                placeholder="Label (e.g., Material)"
                className="zova-store-input flex-1"
                value={spec.key}
                onChange={(event) => updateSpecification(index, "key", event.target.value)}
              />
              <input
                placeholder="Value (e.g., Cotton)"
                className="zova-store-input flex-1"
                value={spec.value}
                onChange={(event) => updateSpecification(index, "value", event.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    specifications:
                      current.specifications.filter((_, specIndex) => specIndex !== index) || [
                        createEmptySpecification(),
                      ],
                  }))
                }
                className="zova-store-toolbar-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="zova-store-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-(--zova-text-strong)">Bulk Pricing Tiers</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                bulk_discount_tiers: [...current.bulk_discount_tiers, createEmptyBulkTier()],
              }))
            }
            className="zova-store-toolbar-btn is-primary"
          >
            Add tier
          </button>
        </div>
        <p className="mt-1 text-sm text-(--zova-text-muted)">Offer discounts for higher quantities.</p>

        <div className="mt-6 space-y-3">
          {form.bulk_discount_tiers.map((tier, index) => (
            <div key={`tier-${index}`} className="rounded-xl border border-[var(--zova-border)] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <input
                  type="number"
                  min="2"
                  placeholder="Min qty"
                  className="zova-store-input flex-1"
                  value={tier.minimum_quantity}
                  onChange={(event) =>
                    updateBulkDiscountTier(index, "minimum_quantity", event.target.value)
                  }
                />
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Discount %"
                  className="zova-store-input flex-1"
                  value={tier.discount_percent}
                  onChange={(event) =>
                    updateBulkDiscountTier(index, "discount_percent", event.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      bulk_discount_tiers:
                        current.bulk_discount_tiers.filter((_, tierIndex) => tierIndex !== index) || [
                          createEmptyBulkTier(),
                        ],
                    }))
                  }
                  className="zova-store-toolbar-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => goToStep(2)} className="zova-store-toolbar-btn flex-1 justify-center py-3">
          <FiChevronLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={() => goToStep(4)}
          className="zova-btn zova-btn-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          Continue
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
