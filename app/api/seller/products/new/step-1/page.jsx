import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep1Redirect() {
  redirect('/store/dashboard/products/new/step-1');
}
