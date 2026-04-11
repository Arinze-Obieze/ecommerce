import { redirect } from 'next/navigation';

export default function LegacySellerWizardIndexRedirect() {
  redirect('/store/dashboard/products/new/step-1');
}
