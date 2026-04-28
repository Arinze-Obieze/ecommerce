import { requireStorePage } from '@/utils/store/auth';
import StoreShell from '@/components/store-console/StoreShell';

export default async function StoreDashboardLayout({ children }) {
  const { membership, store, mfaEnrolled, needsMfa } = await requireStorePage();

  return (
    <StoreShell
      storeName={store?.name}
      storeLogoUrl={store?.logo_url}
      role={membership?.role}
      mfaEnrolled={mfaEnrolled}
      needsMfa={needsMfa}
    >
      {children}
    </StoreShell>
  );
}
