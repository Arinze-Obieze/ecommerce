import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep2Redirect() {
  redirect('/store/dashboard/products/new/step-2');
}
