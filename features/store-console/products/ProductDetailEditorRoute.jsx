'use client';

import { useRouter } from 'next/navigation';
import ProductDetailEditor from '@/features/store-console/products/ProductDetailEditor';

export default function ProductDetailEditorRoute(props) {
  const router = useRouter();

  return (
    <ProductDetailEditor
      {...props}
      onStepChange={(step) => {
        router.push(`?step=${step}`, { scroll: false });
      }}
      onDuplicateComplete={(nextProductId) => {
        router.push(`/store/dashboard/products/${nextProductId}`);
      }}
      onDeleteComplete={() => {
        router.push('/store/dashboard/products');
      }}
    />
  );
}
