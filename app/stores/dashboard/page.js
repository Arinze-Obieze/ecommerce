import { redirect } from 'next/navigation';

export default function StoresDashboardRootRedirect() {
  redirect('/store/dashboard');
}
