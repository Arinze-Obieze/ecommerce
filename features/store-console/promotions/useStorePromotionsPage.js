'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function useStorePromotionsPage() {
  const [view, setView] = useState('list');
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingStore(false);
        return;
      }

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

  return {
    view,
    setView,
    storeId,
    userId,
    loadingStore,
  };
}
