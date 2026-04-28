'use client';

import ProductReviewsManager from '@/components/store-console/ProductReviewsManager';
import AlertBanner from '@/components/store-console/dashboard/AlertBanner';
import ProductBasicInfoStep from '@/features/store-console/products/editor/ProductBasicInfoStep';
import ProductDetailsStep from '@/features/store-console/products/editor/ProductDetailsStep';
import ProductEditorHeader from '@/features/store-console/products/editor/ProductEditorHeader';
import ProductMediaStep from '@/features/store-console/products/editor/ProductMediaStep';
import ProductReviewStep from '@/features/store-console/products/editor/ProductReviewStep';
import ProductScanPanel from '@/features/store-console/products/editor/ProductScanPanel';
import ProductStatusBanner from '@/features/store-console/products/editor/ProductStatusBanner';
import { ProductEditorStepIndicator } from '@/features/store-console/products/editor/productDetailEditor.utils';

export default function ProductDetailEditorView({
  product,
  productId,
  currentStep,
  isScanMode,
  form,
  setForm,
  media,
  primaryImageUrl,
  setPrimaryImageUrl,
  uploading,
  saving,
  acting,
  error,
  notice,
  images,
  publicProductHref,
  displayPrice,
  statusMeta,
  scanState,
  updateSpecification,
  updateBulkDiscountTier,
  removeMedia,
  onFilesSelected,
  saveProduct,
  onStepChange,
  onPrint,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  if (!product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        Product not found.
      </div>
    );
  }

  const {
    selectedScanVariantId,
    setSelectedScanVariantId,
    quickSelling,
    setSellQuantity,
    sellQuantityInput,
    setSellQuantityInput,
    sellOneViaScan,
    quickSellState,
  } = scanState;

  const {
    scanVariants,
    hasScanVariants,
    selectedScanVariantStock,
    effectiveScanStock,
    activeSellQuantity,
    quickSellDisabled,
  } = quickSellState;

  if (isScanMode) {
    return (
      <div className="space-y-4">
        <ProductScanPanel
          product={product}
          publicProductHref={publicProductHref}
          selectedScanVariantId={selectedScanVariantId}
          setSelectedScanVariantId={setSelectedScanVariantId}
          scanVariants={scanVariants}
          hasScanVariants={hasScanVariants}
          selectedScanVariantStock={selectedScanVariantStock}
          effectiveScanStock={effectiveScanStock}
          activeSellQuantity={activeSellQuantity}
          sellQuantityInput={sellQuantityInput}
          setSellQuantity={setSellQuantity}
          setSellQuantityInput={setSellQuantityInput}
          sellOneViaScan={sellOneViaScan}
          quickSelling={quickSelling}
          quickSellDisabled={quickSellDisabled}
        />

        <ProductStatusBanner statusMeta={statusMeta} />
        <AlertBanner type="error" message={error} />
        <AlertBanner type="notice" message={notice} />

        <details className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-bold text-gray-900">Summary (collapsed)</summary>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>Product: <span className="font-semibold">{product.name}</span></p>
            <p>Price: <span className="font-semibold">₦{Number(displayPrice || 0).toLocaleString()}</span></p>
            <p>Stock: <span className="font-semibold">{Number.parseInt(product.stock_quantity, 10) || 0}</span></p>
            <p>SKU: <span className="font-semibold">{product.sku || 'N/A'}</span></p>
          </div>
        </details>

        <details className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-bold text-gray-900">Buyer Reviews (collapsed)</summary>
          <div className="mt-3">
            <ProductReviewsManager productId={productId} />
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductEditorHeader
        product={product}
        publicProductHref={publicProductHref}
        acting={acting}
        onPrint={onPrint}
        onDuplicate={onDuplicate}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
      />

      <ProductStatusBanner statusMeta={statusMeta} rejectionReason={product.rejection_reason} />
      <ProductEditorStepIndicator currentStep={currentStep} />

      <AlertBanner type="error" message={error} />
      <AlertBanner type="notice" message={notice} />

      {currentStep === 1 ? (
        <ProductBasicInfoStep form={form} setForm={setForm} goToStep={onStepChange} />
      ) : null}

      {currentStep === 2 ? (
        <ProductMediaStep
          media={media}
          images={images}
          primaryImageUrl={primaryImageUrl}
          setPrimaryImageUrl={setPrimaryImageUrl}
          removeMedia={removeMedia}
          onFilesSelected={onFilesSelected}
          uploading={uploading}
          goToStep={onStepChange}
        />
      ) : null}

      {currentStep === 3 ? (
        <ProductDetailsStep
          form={form}
          setForm={setForm}
          updateSpecification={updateSpecification}
          updateBulkDiscountTier={updateBulkDiscountTier}
          goToStep={onStepChange}
        />
      ) : null}

      {currentStep === 4 ? (
        <ProductReviewStep
          form={form}
          images={images}
          product={product}
          productId={productId}
          saving={saving}
          saveProduct={saveProduct}
          goToStep={onStepChange}
        />
      ) : null}
    </div>
  );
}
