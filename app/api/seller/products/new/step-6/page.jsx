import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep6Redirect() {
  redirect('/store/dashboard/products/new/step-6');
}
