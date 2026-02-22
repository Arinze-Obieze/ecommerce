import { redirect } from 'next/navigation';

export default async function LegacyAdminSellerDetailPage({ params }) {
  const { id } = await params;
  redirect(`/admin/stores/${id}`);
}
