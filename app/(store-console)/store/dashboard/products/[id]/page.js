import ProductDetailEditorRoute from '@/features/store-console/products/ProductDetailEditorRoute';
import {
  getEditorMode,
  getEditorStep,
} from '@/features/store-console/products/editor/productDetailEditor.utils';

export default async function StoreProductDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const productId = Array.isArray(resolvedParams?.id) ? resolvedParams.id[0] : resolvedParams?.id;
  const mode = getEditorMode(resolvedSearchParams?.mode);
  const currentStep = getEditorStep(resolvedSearchParams?.step, mode);

  return (
    <ProductDetailEditorRoute
      productId={productId}
      mode={mode}
      currentStep={currentStep}
    />
  );
}
