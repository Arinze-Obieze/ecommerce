import { redirect } from 'next/navigation';

export default function LegacySellerDashboardPage() {
  redirect('/store/dashboard');
}
