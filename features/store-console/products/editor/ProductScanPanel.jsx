"use client";

import Link from "next/link";
import { buildVariantLabel } from "@/features/store-console/products/editor/productDetailEditor.utils";

function InfoCard({ label, value, helper }) {
  return (
    <div className="zova-store-subtle-card px-3 py-2">
      <p className="zova-store-label text-[11px] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--zova-text-strong)]">{value}</p>
      {helper ? <p className="text-[11px] text-[var(--zova-text-muted)]">{helper}</p> : null}
    </div>
  );
}

export default function ProductScanPanel({
  product,
  publicProductHref,
  isCompact = false,
  selectedScanVariantId,
  setSelectedScanVariantId,
  scanVariants,
  hasScanVariants,
  selectedScanVariantStock,
  effectiveScanStock,
  activeSellQuantity,
  sellQuantityInput,
  setSellQuantity,
  setSellQuantityInput,
  sellOneViaScan,
  quickSelling,
  quickSellDisabled,
}) {
  const displayPrice = product.discount_price ?? product.price;
  const primaryProductImageUrl = product?.image_urls?.[0] || "";

  return (
    <div className="zova-store-scan-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Scan Mode</p>
      <h2 className={`mt-1 font-bold text-[var(--zova-text-strong)] ${isCompact ? "text-lg" : "text-xl"}`}>
        {isCompact ? "Quick POS Action" : product.name}
      </h2>
      <p className="mt-1 text-xs text-[var(--zova-text-muted)]">
        {isCompact ? "Keep checkout fast with a direct inventory action." : "Keep checkout fast. Scan, confirm quantity, sell."}
      </p>

      {isCompact ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <InfoCard label="Price" value={`₦${Number(displayPrice || 0).toLocaleString()}`} />
          <InfoCard label="Stock" value={Number.parseInt(product.stock_quantity, 10) || 0} />
          <InfoCard label="SKU" value={product.sku || "N/A"} />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-[var(--zova-border)] bg-white">
            {primaryProductImageUrl ? (
              <img src={primaryProductImageUrl} alt={product.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center text-xs font-semibold text-[var(--zova-text-muted)]">
                No image
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <InfoCard
                label="Price"
                value={`₦${Number(displayPrice || 0).toLocaleString()}`}
              />
              <InfoCard
                label="Stock"
                value={`${effectiveScanStock} → ${Math.max(0, effectiveScanStock - activeSellQuantity)}`}
                helper={`After sell: ${Math.max(0, effectiveScanStock - activeSellQuantity)}`}
              />
              <InfoCard label="SKU" value={product.sku || "N/A"} />
            </div>

            <QuantitySection
              hasScanVariants={hasScanVariants}
              selectedScanVariantId={selectedScanVariantId}
              setSelectedScanVariantId={setSelectedScanVariantId}
              scanVariants={scanVariants}
              selectedScanVariantStock={selectedScanVariantStock}
              activeSellQuantity={activeSellQuantity}
              sellQuantityInput={sellQuantityInput}
              setSellQuantity={setSellQuantity}
              setSellQuantityInput={setSellQuantityInput}
            />

            <ActionRow
              publicProductHref={publicProductHref}
              sellOneViaScan={sellOneViaScan}
              quickSelling={quickSelling}
              quickSellDisabled={quickSellDisabled}
              activeSellQuantity={activeSellQuantity}
              hasScanVariants={hasScanVariants}
            />
          </div>
        </div>
      )}

      {isCompact ? (
        <>
          {hasScanVariants ? (
            <div className="zova-store-subtle-card mt-3 p-3">
              <p className="zova-store-label text-[11px] uppercase tracking-wide">Variant</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedScanVariantId}
                  onChange={(event) => setSelectedScanVariantId(event.target.value)}
                  className="zova-store-select"
                >
                  {scanVariants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {buildVariantLabel(variant)} (stock: {Number.parseInt(variant.stock_quantity, 10) || 0})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--zova-text-muted)]">
                  Selected stock: <span className="font-semibold text-[var(--zova-text-body)]">{selectedScanVariantStock}</span>
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sellOneViaScan}
              disabled={quickSellDisabled}
              className="zova-btn zova-btn-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {quickSelling ? "Processing..." : hasScanVariants ? "Sell One Variant (-1)" : "Sell One (-1)"}
            </button>
            {publicProductHref ? (
              <Link href={publicProductHref} target="_blank" className="zova-store-toolbar-btn">
                Open public page
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function QuantitySection({
  hasScanVariants,
  selectedScanVariantId,
  setSelectedScanVariantId,
  scanVariants,
  selectedScanVariantStock,
  activeSellQuantity,
  sellQuantityInput,
  setSellQuantity,
  setSellQuantityInput,
}) {
  return (
    <>
      {hasScanVariants ? (
        <div className="zova-store-subtle-card p-3">
          <p className="zova-store-label text-[11px] uppercase tracking-wide">Variant</p>
          <select
            value={selectedScanVariantId}
            onChange={(event) => setSelectedScanVariantId(event.target.value)}
            className="zova-store-select mt-2"
          >
            {scanVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {buildVariantLabel(variant)} (stock: {Number.parseInt(variant.stock_quantity, 10) || 0})
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--zova-text-muted)]">
            Selected stock: <span className="font-semibold text-[var(--zova-text-body)]">{selectedScanVariantStock}</span>
          </p>
        </div>
      ) : null}

      <div className="zova-store-subtle-card p-3">
        <p className="zova-store-label text-[11px] uppercase tracking-wide">Sell Quantity</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[1, 2, 5].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => {
                setSellQuantity(qty);
                setSellQuantityInput(String(qty));
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                activeSellQuantity === qty
                  ? "border-[var(--zova-primary-action)] bg-[var(--zova-green-soft)] text-[var(--zova-primary-action)]"
                  : "border-[var(--zova-border)] text-[var(--zova-text-body)] hover:bg-white"
              }`}
            >
              {qty}
            </button>
          ))}
          <input
            type="number"
            min="1"
            value={sellQuantityInput}
            onChange={(event) => setSellQuantityInput(event.target.value)}
            onBlur={() => {
              const parsed = Number.parseInt(String(sellQuantityInput || "").trim(), 10);
              const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
              setSellQuantity(normalized);
              setSellQuantityInput(String(normalized));
            }}
            className="zova-store-input w-20"
          />
        </div>
      </div>
    </>
  );
}

function ActionRow({
  publicProductHref,
  sellOneViaScan,
  quickSelling,
  quickSellDisabled,
  activeSellQuantity,
  hasScanVariants,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={sellOneViaScan}
        disabled={quickSellDisabled}
        className="zova-btn zova-btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {quickSelling ? "Processing..." : `Sell ${activeSellQuantity}`}
      </button>
      {publicProductHref ? (
        <Link href={publicProductHref} target="_blank" className="zova-store-toolbar-btn">
          {hasScanVariants ? "Open public page" : "Open public page"}
        </Link>
      ) : null}
    </div>
  );
}
