import { requireStorePage } from '@/utils/store/auth';
import StoreShell from '@/components/store-console/StoreShell';

export default async function StoreDashboardLayout({ children }) {
  const { membership, store } = await requireStorePage();

  return (
    <StoreShell storeName={store?.name} storeLogoUrl={store?.logo_url} role={membership?.role}>
      {children}
    </StoreShell>
  );
}
