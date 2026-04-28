import StoreOrderDetailPage from '@/features/store-console/StoreOrderDetailPage';

export default async function StoreOrderDetailRoute({ params }) {
  const resolvedParams = await params;
  const orderId = Array.isArray(resolvedParams?.id) ? resolvedParams.id[0] : resolvedParams?.id;

  return <StoreOrderDetailPage orderId={orderId || ''} />;
}
