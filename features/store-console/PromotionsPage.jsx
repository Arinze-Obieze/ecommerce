'use client';

import {
  StorePromotionsCreateView,
  StorePromotionsEmpty,
  StorePromotionsListView,
  StorePromotionsLoading,
} from '@/features/store-console/promotions/StorePromotionsSections';
import useStorePromotionsPage from '@/features/store-console/promotions/useStorePromotionsPage';

export default function PromotionsPage() {
  const promotions = useStorePromotionsPage();

  if (promotions.loadingStore) {
    return <StorePromotionsLoading />;
  }

  if (!promotions.storeId) {
    return <StorePromotionsEmpty />;
  }

  return (
    <div className="max-w-4xl p-4 sm:p-6">
      {promotions.view === 'list' ? (
        <StorePromotionsListView storeId={promotions.storeId} onCreate={() => promotions.setView('create')} />
      ) : (
        <StorePromotionsCreateView
          storeId={promotions.storeId}
          userId={promotions.userId}
          onBack={() => promotions.setView('list')}
        />
      )}
    </div>
  );
}
