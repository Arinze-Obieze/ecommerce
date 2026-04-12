import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep3Redirect() {
  redirect('/store/dashboard/products/new/step-3');
}
