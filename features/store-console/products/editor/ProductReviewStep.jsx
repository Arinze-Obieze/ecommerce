"use client";

import { FiChevronLeft } from "react-icons/fi";
import ProductReviewsManager from "@/components/store-console/ProductReviewsManager";

export default function ProductReviewStep({
  form,
  images,
  product,
  productId,
  saving,
  saveProduct,
  goToStep,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="zova-store-card p-6">
          <h2 className="text-lg font-bold text-[var(--zova-text-strong)]">Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-[var(--zova-text-muted)]">Product name</p>
              <p className="font-semibold text-[var(--zova-text-strong)]">{form.name}</p>
            </div>
            <div>
              <p className="text-[var(--zova-text-muted)]">Price</p>
              <p className="font-semibold text-[var(--zova-text-strong)]">₦{Number(form.price).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[var(--zova-text-muted)]">Stock</p>
              <p className="font-semibold text-[var(--zova-text-strong)]">{form.stock_quantity} units</p>
            </div>
            <div>
              <p className="text-[var(--zova-text-muted)]">Images</p>
              <p className="font-semibold text-[var(--zova-text-strong)]">{images.length}</p>
            </div>
          </div>
        </div>

        <div className="zova-store-card p-6">
          <h2 className="text-lg font-bold text-[var(--zova-text-strong)]">Actions</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => saveProduct(false)}
              disabled={saving}
              className="zova-store-toolbar-btn is-primary w-full justify-center py-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            {product.moderation_status !== "pending_review" && product.moderation_status !== "archived" ? (
              <button
                type="button"
                onClick={() => saveProduct(true)}
                disabled={saving}
                className="zova-btn zova-btn-primary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit for review"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ProductReviewsManager productId={productId} />

      <div className="flex gap-3">
        <button type="button" onClick={() => goToStep(3)} className="zova-store-toolbar-btn flex-1 justify-center py-3">
          <FiChevronLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
}
