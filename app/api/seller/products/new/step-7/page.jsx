import { redirect } from 'next/navigation';

export default function LegacySellerWizardStep7Redirect() {
  redirect('/store/dashboard/products/new/step-7');
}
