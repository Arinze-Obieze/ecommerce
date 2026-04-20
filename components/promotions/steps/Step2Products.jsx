'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FiSearch } from 'react-icons/fi';

function Skeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function Step2Products({ state, dispatch, storeId }) {
  const { targetingScope, selectedProductIds, selectedCategories, priceBandMin, priceBandMax } = state;
  const isCategory = targetingScope === 'category';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    const supabase = createClient();
    setLoading(true);

    if (isCategory) {
      (async () => {
        const { data } = await supabase
          .from('product_categories')
          .select('categories(id, name, slug), products!inner(id, store_id, is_active)')
          .eq('products.store_id', storeId)
          .eq('products.is_active', true);

        const map = new Map();
        (data || []).forEach(row => {
          const cat = row.categories;
          if (!cat) return;
          if (!map.has(cat.slug)) map.set(cat.slug, { ...cat, count: 0 });
          map.get(cat.slug).count++;
        });
        setCategories([...map.values()]);
        setLoading(false);
      })();
    } else {
      (async () => {
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, price, discount_price, image_urls, stock_quantity')
          .eq('store_id', storeId)
          .eq('is_active', true)
          .order('name');
        setProducts(data || []);
        setLoading(false);
      })();
    }
  }, [storeId, isCategory]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (id) => {
    if (targetingScope === 'single') {
      dispatch({ type: 'SET_SELECTED_PRODUCTS', ids: [id] });
    } else {
      const next = selectedProductIds.includes(id)
        ? selectedProductIds.filter(x => x !== id)
        : [...selectedProductIds, id];
      dispatch({ type: 'SET_SELECTED_PRODUCTS', ids: next });
    }
  };

  const toggleCategory = (slug) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter(x => x !== slug)
      : [...selectedCategories, slug];
    dispatch({ type: 'SET_SELECTED_CATEGORIES', slugs: next });
  };

  if (loading) return <Skeleton />;

  if (isCategory) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Select categories</h2>
          <p className="text-sm text-gray-500 mt-1">New products you add to these categories will automatically get this promotion.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No categories found in your store.</div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => {
              const selected = selectedCategories.includes(cat.slug);
              return (
                <label key={cat.slug} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-[#2E6417] bg-[#2E6417]/5' : 'border-[#E8E4DC] bg-white hover:border-[#2E6417]/30'}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleCategory(cat.slug)} className="w-4 h-4 accent-[#2E6417]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.count} product{cat.count !== 1 ? 's' : ''}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border border-[#E8E4DC] p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!(priceBandMin || priceBandMax)}
              onChange={e => {
                if (!e.target.checked) {
                  dispatch({ type: 'SET_PRICE_BAND', min: '', max: '' });
                }
              }}
              className="w-4 h-4 accent-[#2E6417]"
            />
            <span className="text-sm font-medium text-gray-700">Only products within a price range</span>
          </label>
          {(priceBandMin !== '' || priceBandMax !== '') && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Min price (₦)</label>
                <input
                  type="number"
                  value={priceBandMin}
                  onChange={e => dispatch({ type: 'SET_PRICE_BAND', min: e.target.value, max: priceBandMax })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2E6417]"
                />
              </div>
              <span className="text-gray-400 mt-5">–</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Max price (₦)</label>
                <input
                  type="number"
                  value={priceBandMax}
                  onChange={e => dispatch({ type: 'SET_PRICE_BAND', min: priceBandMin, max: e.target.value })}
                  placeholder="No limit"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#2E6417]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {targetingScope === 'single' ? 'Select a product' : 'Select products'}
        </h2>
        {targetingScope === 'bulk' && selectedProductIds.length > 0 && (
          <p className="text-sm text-[#2E6417] font-semibold mt-1">{selectedProductIds.length} selected</p>
        )}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2E6417]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          {products.length === 0 ? 'No active products in your store.' : 'No products match your search.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map(p => {
            const selected = selectedProductIds.includes(p.id);
            const price = p.discount_price || p.price;
            return (
              <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-[#2E6417] bg-[#2E6417]/5' : 'border-[#E8E4DC] bg-white hover:border-[#2E6417]/30'}`}>
                {targetingScope === 'single'
                  ? <input type="radio" checked={selected} onChange={() => toggleProduct(p.id)} className="w-4 h-4 accent-[#2E6417]" />
                  : <input type="checkbox" checked={selected} onChange={() => toggleProduct(p.id)} className="w-4 h-4 accent-[#2E6417]" />
                }
                <img
                  src={p.image_urls?.[0] || 'https://placehold.co/48x48?text=.'}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">₦{Number(price).toLocaleString('en-NG')} · {p.stock_quantity} in stock</p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
