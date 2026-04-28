'use client';

import { FiPlus } from 'react-icons/fi';
import PromotionList from '@/components/promotions/PromotionList';
import PromotionWizard from '@/components/promotions/PromotionWizard';

export function StorePromotionsLoading() {
  return (
    <div className="space-y-3 p-6">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export function StorePromotionsEmpty() {
  return (
    <div className="p-6 text-center text-sm text-gray-500">
      Store not found. Make sure you have owner or manager access.
    </div>
  );
}

export function StorePromotionsListView({ storeId, onCreate }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-0.5 text-sm text-gray-500">Create discounts and deals for your products</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          <FiPlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Promotion</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <PromotionList storeId={storeId} onCreate={onCreate} />
    </>
  );
}

export function StorePromotionsCreateView({ storeId, userId, onBack }) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
        >
          ← Promotions
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">Create Promotion</span>
      </div>

      <PromotionWizard storeId={storeId} userId={userId} onDone={onBack} />
    </>
  );
}
