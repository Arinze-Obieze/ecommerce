import AdminStoreDetailPage from '@/features/admin/AdminStoreDetailPage';

export default function AdminStoreDetailRoute({ params }) {
  return <AdminStoreDetailPage storeId={params?.id} />;
}
