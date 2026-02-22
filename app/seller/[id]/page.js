import { redirect } from 'next/navigation';

export default async function LegacySellerPage({ params }) {
  const { id } = await params;
  redirect(`/store/${id}`);
}
