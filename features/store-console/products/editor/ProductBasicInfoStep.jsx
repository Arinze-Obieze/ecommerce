"use client";

import { FiChevronRight } from "react-icons/fi";

export default function ProductBasicInfoStep({ form, setForm, goToStep }) {
  return (
    <div className="space-y-6">
      <div className="zova-store-card p-6">
        <h2 className="text-lg font-bold text-(--zova-text-strong)">Basic Information</h2>
        <p className="mt-1 text-sm text-(--zova-text-muted)">Enter your product&apos;s core details</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="zova-store-label">Product name *</span>
            <input
              className="zova-store-input mt-1"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label className="block">
            <span className="zova-store-label">Slug *</span>
            <input
              className="zova-store-input mt-1"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            />
          </label>

          <label className="block">
            <span className="zova-store-label">Description *</span>
            <textarea
              rows={5}
              className="zova-store-textarea mt-1"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="zova-store-label">Price *</span>
              <input
                type="text"
                inputMode="decimal"
                className="zova-store-input mt-1"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              />
              <span className="mt-1 block text-xs text-(--zova-text-muted)">Whole Naira only. Example: `5000`.</span>
            </label>

            <label className="block">
              <span className="zova-store-label">Sale price</span>
              <input
                type="text"
                inputMode="decimal"
                className="zova-store-input mt-1"
                value={form.discount_price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, discount_price: event.target.value }))
                }
              />
              <span className="mt-1 block text-xs text-(--zova-text-muted)">Leave blank or enter a whole-Naira value lower than the main price.</span>
            </label>
          </div>

          <label className="block">
            <span className="zova-store-label">Stock quantity *</span>
            <input
              type="number"
              min="0"
              className="zova-store-input mt-1"
              value={form.stock_quantity}
              onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="zova-btn zova-btn-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          Continue
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
