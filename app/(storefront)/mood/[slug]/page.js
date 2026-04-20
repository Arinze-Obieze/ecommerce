"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// ── Constants ──────────────────────────────────────────────────────────────────

const MOOD_META = {
  owambe:         { emoji: "🎉" },
  casual_chill:   { emoji: "😎" },
  office_ready:   { emoji: "💼" },
  date_night:     { emoji: "🌙" },
  sunday_best:    { emoji: "⛪" },
  street_trendy:  { emoji: "🛹" },
  soft_luxury:    { emoji: "✨" },
  travel_weekend: { emoji: "✈️" },
};

const SORT_OPTIONS = [
  { value: "fit_desc",    label: "Best Match"        },
  { value: "newest",      label: "New Arrivals"       },
  { value: "price_asc",   label: "Price: Low → High"  },
  { value: "price_desc",  label: "Price: High → Low"  },
  { value: "rating_desc", label: "Top Rated"          },
];

const PRICE_PRESETS = [
  { label: "Under ₦5k",    min: 0,     max: 5000      },
  { label: "₦5k – ₦15k",  min: 5000,  max: 15000     },
  { label: "₦15k – ₦30k", min: 15000, max: 30000     },
  { label: "₦30k – ₦50k", min: 30000, max: 50000     },
  { label: "Above ₦50k",  min: 50000, max: Infinity   },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtPrice(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function discountPct(price, discountPrice) {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

// ── Star Rating ────────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  const stars = Math.round(Number(rating || 0));
  return (
    <div className="flex gap-px">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= stars ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const price    = Number(product.price || 0);
  const discPrice = product.discount_price ? Number(product.discount_price) : null;
  const pct      = discountPct(price, discPrice);
  const img      = product.image_urls?.[0] || null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] mb-3">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">👗</div>
        )}

        {pct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#2E6417] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{pct}%
          </span>
        )}

        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span className="absolute top-2.5 right-2.5 bg-white/90 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
            {product.stock_quantity} left
          </span>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">Sold Out</span>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={e => e.preventDefault()}
            className="w-full bg-[#2E6417] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#245213] transition-colors shadow-lg"
          >
            Quick Add
          </button>
        </div>
      </div>

      <div className="space-y-1 px-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest truncate">
          {product.category_name || "Collection"}
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2E6417] transition-colors">
          {product.name}
        </p>
        <StarRating rating={product.rating} />
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-black text-gray-900">{fmtPrice(discPrice || price)}</span>
          {pct > 0 && <span className="text-xs text-gray-400 line-through">{fmtPrice(price)}</span>}
        </div>
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {product.colors.slice(0, 4).map(c => (
              <span key={c} className="text-[10px] text-gray-500 bg-gray-100 rounded-md px-1.5 py-0.5">{c}</span>
            ))}
            {product.colors.length > 4 && <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Filter Section ─────────────────────────────────────────────────────────────

function FilterSection({ title, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</span>
          {badge > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2E6417] text-white text-[9px] font-black">
              {badge}
            </span>
          )}
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ sort, setSort, pricePreset, setPricePreset, selectedCategories, setSelectedCategories, selectedSizes, setSelectedSizes, selectedColors, setSelectedColors, availableCategories, availableSizes, availableColors, activeFilterCount, onClearAll }) {
  const toggleArr = (setter, val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const CheckRow = ({ active, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all ${active ? "bg-[#2E6417]/6 text-[#2E6417] font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}>
      <span className={`w-4 h-4 rounded-[5px] border flex-shrink-0 flex items-center justify-center transition-all ${active ? "bg-[#2E6417] border-[#2E6417]" : "border-gray-300"}`}>
        {active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </span>
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Sidebar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          <span className="text-sm font-bold text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2E6417] text-white text-[10px] font-black">{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={onClearAll} className="text-xs font-semibold text-[#2E6417] hover:text-[#245213] transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="px-4 pb-2">

        {/* Sort */}
        <FilterSection title="Sort By" badge={0} defaultOpen={true}>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm transition-all ${sort === opt.value ? "bg-[#2E6417]/6 text-[#2E6417] font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}>
                {opt.label}
                {sort === opt.value && (
                  <span className="w-4 h-4 rounded-full bg-[#2E6417] flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price" badge={pricePreset !== null ? 1 : 0} defaultOpen={true}>
          <div className="space-y-0.5">
            {PRICE_PRESETS.map((preset, i) => (
              <CheckRow key={i} active={pricePreset === i} label={preset.label} onClick={() => setPricePreset(pricePreset === i ? null : i)} />
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        {availableCategories.length > 0 && (
          <FilterSection title="Category" badge={selectedCategories.length} defaultOpen={true}>
            <div className="space-y-0.5">
              {availableCategories.map(cat => (
                <CheckRow key={cat.slug} active={selectedCategories.includes(cat.slug)} label={cat.name} onClick={() => toggleArr(setSelectedCategories, cat.slug)} />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Size */}
        {availableSizes.length > 0 && (
          <FilterSection title="Size" badge={selectedSizes.length} defaultOpen={true}>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(sz => {
                const active = selectedSizes.includes(sz);
                return (
                  <button key={sz} onClick={() => toggleArr(setSelectedSizes, sz)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? "border-[#2E6417] bg-[#2E6417] text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#2E6417]/40 hover:text-[#2E6417]"}`}>
                    {sz}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Color */}
        {availableColors.length > 0 && (
          <FilterSection title="Color" badge={selectedColors.length} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {availableColors.map(color => {
                const active = selectedColors.includes(color);
                return (
                  <button key={color} onClick={() => toggleArr(setSelectedColors, color)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active ? "border-[#2E6417] bg-[#2E6417]/8 text-[#2E6417]" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                    {color}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}
      </div>
    </div>
  );
}

// ── Filter Chip ────────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-[#2E6417]/8 text-[#2E6417] text-xs font-semibold border border-[#2E6417]/15">
      {label}
      <button onClick={onRemove} className="w-3.5 h-3.5 rounded-full bg-[#2E6417]/15 hover:bg-[#2E6417] hover:text-white flex items-center justify-center transition-colors leading-none">×</button>
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MoodPage() {
  const params = useParams();
  const slug   = params?.slug || "";

  const [mood, setMood]               = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [sort, setSort]                             = useState("fit_desc");
  const [pricePreset, setPricePreset]               = useState(null);
  const [selectedSizes, setSelectedSizes]           = useState([]);
  const [selectedColors, setSelectedColors]         = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters]   = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setError(null);
    const supabase = createClient();

    (async () => {
      const { data: moodDef, error: moodErr } = await supabase
        .from("mood_definitions").select("*").eq("mood_key", slug).eq("is_active", true).maybeSingle();
      if (moodErr || !moodDef) { setError("Mood not found."); setLoading(false); return; }
      setMood(moodDef);

      const { data: tags, error: tagsErr } = await supabase
        .from("product_mood_tags")
        .select(`mood_fit_score, products ( id, name, slug, price, discount_price, image_urls, rating, sizes, colors, stock_quantity, is_active, created_at, product_categories ( is_primary, categories ( id, name, slug, parent_id ) ) )`)
        .eq("mood_key", slug).eq("is_active", true).order("mood_fit_score", { ascending: false });

      if (tagsErr) { setError("Failed to load products."); setLoading(false); return; }

      setAllProducts((tags || []).filter(t => t.products?.is_active === true).map(t => {
        const p = t.products;
        const cat = p.product_categories?.find(pc => pc.is_primary)?.categories;
        return { ...p, mood_fit_score: t.mood_fit_score, category_name: cat?.name || null, category_slug: cat?.slug || null };
      }));
      setLoading(false);
    })();
  }, [slug]);

  const availableSizes = useMemo(() => {
    const s = new Set(); allProducts.forEach(p => (p.sizes || []).forEach(sz => s.add(sz))); return [...s].sort();
  }, [allProducts]);
  const availableColors = useMemo(() => {
    const s = new Set(); allProducts.forEach(p => (p.colors || []).forEach(c => s.add(c))); return [...s].sort();
  }, [allProducts]);
  const availableCategories = useMemo(() => {
    const m = new Map(); allProducts.forEach(p => { if (p.category_name && p.category_slug) m.set(p.category_slug, p.category_name); });
    return [...m.entries()].map(([slug, name]) => ({ slug, name }));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];
    if (pricePreset !== null) { const { min, max } = PRICE_PRESETS[pricePreset]; list = list.filter(p => { const e = p.discount_price ? Number(p.discount_price) : Number(p.price); return e >= min && e <= max; }); }
    if (selectedSizes.length)      list = list.filter(p => selectedSizes.some(s => (p.sizes || []).includes(s)));
    if (selectedColors.length)     list = list.filter(p => selectedColors.some(c => (p.colors || []).includes(c)));
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.category_slug));
    switch (sort) {
      case "newest":     list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); break;
      case "price_asc":  list.sort((a,b) => (Number(a.discount_price||a.price)) - (Number(b.discount_price||b.price))); break;
      case "price_desc": list.sort((a,b) => (Number(b.discount_price||b.price)) - (Number(a.discount_price||a.price))); break;
      case "rating_desc":list.sort((a,b) => Number(b.rating||0) - Number(a.rating||0)); break;
      default:           list.sort((a,b) => Number(b.mood_fit_score) - Number(a.mood_fit_score));
    }
    return list;
  }, [allProducts, pricePreset, selectedSizes, selectedColors, selectedCategories, sort]);

  const activeFilters = useMemo(() => {
    const f = [];
    if (pricePreset !== null) f.push({ key: "price", label: PRICE_PRESETS[pricePreset].label, clear: () => setPricePreset(null) });
    selectedSizes.forEach(s     => f.push({ key:`sz-${s}`,   label: s,   clear: () => setSelectedSizes(p => p.filter(x=>x!==s)) }));
    selectedColors.forEach(c    => f.push({ key:`cl-${c}`,   label: c,   clear: () => setSelectedColors(p => p.filter(x=>x!==c)) }));
    selectedCategories.forEach(cat => { const name = availableCategories.find(a=>a.slug===cat)?.name||cat; f.push({ key:`cat-${cat}`, label: name, clear: () => setSelectedCategories(p=>p.filter(x=>x!==cat)) }); });
    return f;
  }, [pricePreset, selectedSizes, selectedColors, selectedCategories, availableCategories]);

  const clearAllFilters = useCallback(() => { setPricePreset(null); setSelectedSizes([]); setSelectedColors([]); setSelectedCategories([]); }, []);

  const meta = MOOD_META[slug] || { emoji: "🛍️" };

  const sidebarProps = { sort, setSort, pricePreset, setPricePreset, selectedCategories, setSelectedCategories, selectedSizes, setSelectedSizes, selectedColors, setSelectedColors, availableCategories, availableSizes, availableColors, activeFilterCount: activeFilters.length, onClearAll: clearAllFilters };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#2E6417] rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading collection…</p>
      </div>
    </div>
  );

  if (error || !mood) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-3xl">😕</p>
      <p className="text-gray-600 font-medium">{error || "This mood doesn't exist."}</p>
      <Link href="/" className="text-sm text-[#2E6417] font-semibold">← Back to home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ── Clean Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-5">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/mood" className="hover:text-gray-600 transition-colors">Moods</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">{mood.label}</span>
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{meta.emoji}</span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{mood.label}</h1>
              </div>
              {mood.description && (
                <p className="text-sm text-gray-500 max-w-lg leading-relaxed">{mood.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-400">
                <span className="font-bold text-gray-700">{filteredProducts.length}</span> of {allProducts.length} pieces
              </span>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                </svg>
                Filter & Sort
                {activeFilters.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#2E6417] text-white text-[10px] font-black flex items-center justify-center">{activeFilters.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Active chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {activeFilters.map(f => <FilterChip key={f.key} label={f.label} onRemove={f.clear} />)}
              <button onClick={clearAllFilters} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-7">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-6">
              <Sidebar {...sidebarProps} />
            </div>
          </aside>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">🔍</div>
                <p className="text-base font-bold text-gray-900 mb-1">No products match your filters</p>
                <p className="text-sm text-gray-500 mb-6">Try removing a filter or two</p>
                <button onClick={clearAllFilters} className="px-5 py-2.5 rounded-xl bg-[#2E6417] text-white font-bold text-sm hover:bg-[#245213] transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-[340px] bg-[#fafafa] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
              <span className="text-sm font-black text-gray-900">Filter & Sort</span>
              <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Sidebar {...sidebarProps} />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2.5">
              <button onClick={clearAllFilters} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Clear</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold">Show {filteredProducts.length} items</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}