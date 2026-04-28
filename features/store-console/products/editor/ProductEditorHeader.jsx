"use client";

import Link from "next/link";

export default function ProductEditorHeader({
  product,
  publicProductHref,
  acting,
  onPrint,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Link href="/store/dashboard/products" className="text-sm font-semibold text-primary hover:text-primary-hover">
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--zova-text-strong)]">{product.name}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {publicProductHref && product.moderation_status === "approved" ? (
          <Link
            href={publicProductHref}
            target="_blank"
            className="zova-store-toolbar-btn"
          >
            View live
          </Link>
        ) : null}

        <button type="button" onClick={onPrint} className="zova-store-toolbar-btn">
          Print labels
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          disabled={Boolean(acting)}
          className="zova-store-toolbar-btn is-primary disabled:opacity-50"
        >
          Duplicate
        </button>

        {product.moderation_status === "archived" ? (
          <button
            type="button"
            onClick={onUnarchive}
            disabled={Boolean(acting)}
            className="zova-store-toolbar-btn"
          >
            Unarchive
          </button>
        ) : (
          <button
            type="button"
            onClick={onArchive}
            disabled={Boolean(acting)}
            className="zova-store-toolbar-btn is-danger"
          >
            Archive
          </button>
        )}

        {["draft", "rejected", "archived"].includes(product.moderation_status) ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={Boolean(acting)}
            className="zova-store-toolbar-btn is-danger"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
