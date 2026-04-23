'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FiPlus } from 'react-icons/fi';
import PromotionList from '@/components/promotions/PromotionList';
import PromotionWizard from '@/components/promotions/PromotionWizard';

export default function PromotionsPage() {
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: membership } = await supabase
        .from('store_users')
        .select('store_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('role', ['owner', 'manager'])
        .limit(1)
        .single();

      if (membership?.store_id) setStoreId(membership.store_id);
      setLoadingStore(false);
    })();
  }, []);

  if (loadingStore) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-48 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Store not found. Make sure you have owner or manager access.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {view === 'list' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Promotions</h1>
              <p className="text-sm text-gray-500 mt-0.5">Create discounts and deals for your products</p>
            </div>
            <button
              onClick={() => setView('create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E6417] text-white text-sm font-bold hover:bg-[#245213] transition-colors shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Promotion</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          <PromotionList
            storeId={storeId}
            onCreate={() => setView('create')}
          />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView('list')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Promotions
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">Create Promotion</span>
          </div>

          <PromotionWizard
            storeId={storeId}
            userId={userId}
            onDone={() => setView('list')}
          />
        </>
      )}
    </div>
  );
}
