'use client';

import { useMemo } from 'react';
import ProductDetailEditorView from '@/features/store-console/products/ProductDetailEditorView';
import useProductEditorActions from '@/features/store-console/products/editor/useProductEditorActions';
import useProductEditorForm from '@/features/store-console/products/editor/useProductEditorForm';
import useProductEditorResource from '@/features/store-console/products/editor/useProductEditorResource';
import useProductScanState from '@/features/store-console/products/editor/useProductScanState';
import { getStatusMeta } from '@/features/store-console/products/editor/productDetailEditor.utils';

export default function ProductDetailEditor({
  productId,
  mode = 'editor',
  currentStep = 1,
  onStepChange,
  onDuplicateComplete,
  onDeleteComplete,
}) {
  const isScanMode = mode === 'scan';
  const {
    product,
    loading,
    error,
    setError,
    notice,
    setNotice,
    loadProduct,
  } = useProductEditorResource(productId);

  const formState = useProductEditorForm({
    product,
    productId,
    loadProduct,
    setError,
    setNotice,
  });

  const scanState = useProductScanState({
    product,
    loadProduct,
    setError,
    setNotice,
  });

  const actionState = useProductEditorActions({
    product,
    productId,
    loadProduct,
    setError,
    setNotice,
    onDuplicateComplete,
    onDeleteComplete,
  });

  const statusMeta = useMemo(
    () => getStatusMeta(product?.moderation_status),
    [product?.moderation_status]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  const images = formState.media.filter((item) => item.type === 'image');
  const publicProductHref = product?.slug ? `/products/${product.slug}` : '';
  const displayPrice = product?.discount_price ?? product?.price ?? 0;

  return (
    <ProductDetailEditorView
      product={product}
      productId={productId}
      currentStep={currentStep}
      isScanMode={isScanMode}
      form={formState.form}
      setForm={formState.setForm}
      media={formState.media}
      primaryImageUrl={formState.primaryImageUrl}
      setPrimaryImageUrl={formState.setPrimaryImageUrl}
      uploading={formState.uploading}
      saving={formState.saving}
      acting={actionState.acting}
      error={error}
      notice={notice}
      images={images}
      publicProductHref={publicProductHref}
      displayPrice={displayPrice}
      statusMeta={statusMeta}
      scanState={scanState}
      updateSpecification={formState.updateSpecification}
      updateBulkDiscountTier={formState.updateBulkDiscountTier}
      removeMedia={formState.removeMedia}
      onFilesSelected={formState.onFilesSelected}
      saveProduct={formState.saveProduct}
      onStepChange={onStepChange}
      onPrint={actionState.printProductLabel}
      onDuplicate={actionState.duplicateProduct}
      onArchive={() => actionState.toggleArchive(true)}
      onUnarchive={() => actionState.toggleArchive(false)}
      onDelete={actionState.deleteProduct}
    />
  );
}
