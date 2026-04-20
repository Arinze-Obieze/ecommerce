'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FiPlus, FiTrash2, FiTag, FiZap, FiInfo } from 'react-icons/fi';

function statusPill(promo) {
  const now = new Date();
  const starts = new Date(promo.starts_at);
  const ends = promo.ends_at ? new Date(promo.ends_at) : null;

  if (!promo.is_active && promo.approved_by_zova) return { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700' };
  if (!promo.is_active) return { label: 'Draft', cls: 'bg-gray-100 text-gray-600' };
  if (!promo.approved_by_zova) return { label: 'Pending', cls: 'bg-amber-100 text-amber-700' };
  if (starts > now) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700' };
  if (ends && ends < now) return { label: 'Expired', cls: 'bg-gray-100 text-gray-500' };
  return { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' };
}

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function discountLabel(promo) {
  if (promo.discount_type === 'percentage') return `${promo.discount_value}% off`;
  if (promo.discount_type === 'fixed_amount') return `₦${Number(promo.discount_value).toLocaleString('en-NG')} off`;
  if (promo.discount_type === 'buy_x_get_y') return `Buy ${promo.buy_x_quantity} get ${promo.get_y_quantity} free`;
  return promo.discount_type;
}

function targetingLabel(promo) {
  if (promo.applies_to === 'all') return 'All products';
  if (promo.applies_to === 'categories') return 'By category';
  if (promo.applies_to === 'products') return 'Specific products';
  return promo.applies_to;
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function PromotionList({ storeId, onCreate }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [activating, setActivating] = useState(null);

  const load = async () => {
    if (!storeId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('promotions')
      .select('*, auto_activated, promotion_types(key, label, icon)')
      .eq('store_id', storeId)
      .eq('owner_type', 'seller')
      .order('created_at', { ascending: false });
    setPromotions(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [storeId]);

  const handleActivate = async (id) => {
    setActivating(id);
    const supabase = createClient();
    await supabase.from('promotions').update({ is_active: true }).eq('id', id);
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: true } : p));
    setActivating(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion? This cannot be undone.')) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from('promotions').delete().eq('id', id);
    setPromotions(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  };

  if (loading) return <Skeleton />;

  if (promotions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-[#2E6417]/10 mx-auto mb-4 flex items-center justify-center">
          <FiTag className="w-6 h-6 text-[#2E6417]" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No promotions yet</h3>
        <p className="text-sm text-gray-500 mb-6">Create your first promotion to boost sales with discounts.</p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E6417] text-white text-sm font-bold hover:bg-[#245213] transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Create Your First Promotion
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {promotions.map(promo => {
        const pill = statusPill(promo);
        const type = promo.promotion_types;
        return (
          <div key={promo.id} className="rounded-2xl border border-[#E8E4DC] bg-white p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2E6417]/10 flex items-center justify-center flex-shrink-0 text-xl">
              {type?.icon || '🏷️'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-gray-900 truncate">{promo.display_name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pill.cls}`}>{pill.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500">{type?.label || 'Custom'}</span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-500">{targetingLabel(promo)}</span>
                <span className="text-gray-200">·</span>
                <span className="text-xs font-semibold text-gray-700">{discountLabel(promo)}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {fmt(promo.starts_at)}{promo.ends_at ? ` – ${fmt(promo.ends_at)}` : ' · No end date'}
              </p>
              {promo.auto_activated && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 w-fit">
                  <FiInfo className="w-3 h-3 flex-shrink-0" />
                  Start time passed — this promotion was auto-activated
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {promo.approved_by_zova && !promo.is_active && (
                <button
                  onClick={() => handleActivate(promo.id)}
                  disabled={activating === promo.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E6417] text-white text-xs font-bold hover:bg-[#245213] transition-colors disabled:opacity-40"
                  title="Activate promotion"
                >
                  <FiZap className="w-3.5 h-3.5" />
                  {activating === promo.id ? 'Activating…' : 'Activate'}
                </button>
              )}
              <button
                onClick={() => handleDelete(promo.id)}
                disabled={deleting === promo.id}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
