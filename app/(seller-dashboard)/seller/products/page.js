import { redirect } from 'next/navigation';

export default function SellerProductsLegacyRedirect() {
  redirect('/store/dashboard/products');
}
