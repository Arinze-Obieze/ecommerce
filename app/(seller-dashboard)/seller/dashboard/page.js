import { redirect } from 'next/navigation';

export default function SellerDashboardLegacyRedirect() {
  redirect('/store/dashboard');
}
