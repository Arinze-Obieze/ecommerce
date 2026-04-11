import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep5Redirect() {
  redirect('/store/dashboard/products/new/step-5');
}
