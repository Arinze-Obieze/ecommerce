import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep4Redirect() {
  redirect('/store/dashboard/products/new/step-4');
}
