import { redirect } from 'next/navigation';

export default function LegacyAdminSellersPage() {
  redirect('/admin/stores');
}
