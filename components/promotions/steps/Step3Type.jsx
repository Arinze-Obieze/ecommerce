'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function Step3Type({ state, dispatch }) {
  const { promotionTypeId, displayName, customName } = state;
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('promotion_types')
      .select('*')
      .eq('owner_type', 'seller')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => { setTypes(data || []); setLoading(false); });
  }, []);

  const selectType = (type) => {
    dispatch({ type: 'SET_PROMO_TYPE', typeId: type.id, allowsCode: type.allows_code, allowsBundle: type.allows_bundle });
    if (!customName) {
      dispatch({ type: 'SET_DISPLAY_NAME', name: type.label });
    }
  };

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">What kind of promotion is this?</h2>
        <p className="text-sm text-gray-500 mt-1">Pick a type to get started. You can customise the name below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map(t => {
          const selected = promotionTypeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectType(t)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                selected ? 'border-[#2E6417] bg-[#2E6417]/5' : 'border-[#E8E4DC] bg-white hover:border-[#2E6417]/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${selected ? 'text-[#2E6417]' : 'text-gray-900'}`}>{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Or give it a custom name for your store
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <input
          type="text"
          value={customName}
          maxLength={30}
          onChange={e => {
            dispatch({ type: 'SET_CUSTOM_NAME', name: e.target.value });
            dispatch({ type: 'SET_DISPLAY_NAME', name: e.target.value || (types.find(t => t.id === promotionTypeId)?.label || '') });
          }}
          placeholder="e.g. Eid Special, Birthday Blowout..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2E6417]"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          This name shows as the badge on your product cards. Keep it short ({displayName?.length || 0}/30).
        </p>
      </div>
    </div>
  );
}
