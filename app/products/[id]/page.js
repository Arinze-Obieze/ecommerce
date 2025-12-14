import { ProductDetailClient } from '@/components/ProductDetailClient';

export default function ProductDetail({ params }) {
  const { id } = params;

  return <ProductDetailClient id={id} />;
}
