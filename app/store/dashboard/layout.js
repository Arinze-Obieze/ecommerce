import { requireStorePage } from '@/utils/storeAuth';
import StoreShell from '@/components/Store/StoreShell';

export default async function StoreDashboardLayout({ children }) {
  const { membership, store } = await requireStorePage();

  return (
    <StoreShell storeName={store?.name} role={membership?.role}>
      {children}
    </StoreShell>
  );
}
