'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MOOD_META, MOOD_IMAGES, MOOD_PRICE_PRESETS } from '@/features/storefront/mood/mood.constants';
import { deriveGender, filterMoodProducts, sortMoodProducts } from '@/features/storefront/mood/mood.utils';

export default function useMoodPage(slug) {
  const [mood, setMood]                       = useState(null);
  const [allProducts, setAllProducts]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [isFallback, setIsFallback]           = useState(false);
  const [sort, setSort]                       = useState('fit_desc');
  const [pricePreset, setPricePreset]         = useState(null);
  const [selectedSizes, setSelectedSizes]     = useState([]);
  const [selectedColors, setSelectedColors]   = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGender, setSelectedGender]   = useState(null);
  const [inStock, setInStock]                 = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);
    const supabase = createClient();

    (async () => {
      const { data: moodDef, error: moodErr } = await supabase
        .from('mood_definitions')
        .select('*')
        .eq('mood_key', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (moodErr || !moodDef) {
        setError('Mood not found.');
        setLoading(false);
        return;
      }

      setMood(moodDef);

      const { data: tags, error: tagsErr } = await supabase
        .from('product_mood_tags')
        .select(`
          mood_fit_score,
          products (
            id, name, slug, price, discount_price, image_urls, rating,
            sizes, colors, stock_quantity, is_active, created_at,
            product_categories (
              is_primary,
              categories (
                id, name, slug, parent_id,
                parent_cat:categories!parent_id ( name )
              )
            )
          )
        `)
        .eq('mood_key', slug)
        .eq('is_active', true)
        .order('mood_fit_score', { ascending: false });

      if (tagsErr) {
        setError('Failed to load products.');
        setLoading(false);
        return;
      }

      const mapped = (tags || [])
        .filter((tag) => tag.products?.is_active === true)
        .map((tag) => {
          const product = tag.products;
          const catEntry = product.product_categories?.find((e) => e.is_primary);
          const cat = catEntry?.categories;
          const parentName = cat?.parent_cat?.name || null;
          const gender = deriveGender(parentName || cat?.name);
          return {
            ...product,
            mood_fit_score: tag.mood_fit_score,
            category_name: cat?.name || null,
            category_slug: cat?.slug || null,
            gender,
          };
        });

      if (mapped.length > 0) {
        setAllProducts(mapped);
      } else {
        // Fallback: show trending products when no mood-tagged products exist yet
        try {
          const res = await fetch(`/api/products?sortBy=smart&limit=48&page=1`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAllProducts(json.data.map((p) => ({
              ...p,
              mood_fit_score: 0,
              gender: deriveGender(p.category_name),
            })));
            setIsFallback(true);
          } else {
            setAllProducts([]);
          }
        } catch {
          setAllProducts([]);
        }
      }

      setLoading(false);
    })();
  }, [slug]);

  const availableSizes = useMemo(() => {
    const s = new Set();
    allProducts.forEach((p) => (p.sizes || []).forEach((v) => s.add(v)));
    return [...s].sort();
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const s = new Set();
    allProducts.forEach((p) => (p.colors || []).forEach((v) => s.add(v)));
    return [...s].sort();
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    const m = new Map();
    allProducts.forEach((p) => {
      if (p.category_name && p.category_slug) m.set(p.category_slug, p.category_name);
    });
    return [...m.entries()].map(([slug, name]) => ({ slug, name }));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = filterMoodProducts({
      products: allProducts,
      pricePreset,
      selectedSizes,
      selectedColors,
      selectedCategories,
      selectedGender,
      inStock,
    });
    return sortMoodProducts(filtered, sort);
  }, [allProducts, pricePreset, selectedSizes, selectedColors, selectedCategories, selectedGender, inStock, sort]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (pricePreset !== null)
      filters.push({ key: 'price', label: MOOD_PRICE_PRESETS[pricePreset].label, clear: () => setPricePreset(null) });
    if (inStock)
      filters.push({ key: 'instock', label: 'In Stock', clear: () => setInStock(false) });
    selectedSizes.forEach((sz) =>
      filters.push({ key: `sz-${sz}`, label: sz, clear: () => setSelectedSizes((c) => c.filter((v) => v !== sz)) }));
    selectedColors.forEach((cl) =>
      filters.push({ key: `cl-${cl}`, label: cl, clear: () => setSelectedColors((c) => c.filter((v) => v !== cl)) }));
    selectedCategories.forEach((cat) => {
      const name = availableCategories.find((c) => c.slug === cat)?.name || cat;
      filters.push({ key: `cat-${cat}`, label: name, clear: () => setSelectedCategories((c) => c.filter((v) => v !== cat)) });
    });
    return filters;
  }, [pricePreset, inStock, selectedSizes, selectedColors, selectedCategories, availableCategories]);

  const clearAllFilters = useCallback(() => {
    setPricePreset(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedGender(null);
    setInStock(false);
  }, []);

  return {
    slug,
    mood,
    meta: MOOD_META[slug] || { emoji: '🛍️', color: '#2E6417', gradient: 'linear-gradient(135deg,#2E6417,#3a7a1e)' },
    image: MOOD_IMAGES[slug] || null,
    isFallback,
    allProducts,
    loading,
    error,
    sort, setSort,
    pricePreset, setPricePreset,
    selectedSizes, setSelectedSizes,
    selectedColors, setSelectedColors,
    selectedCategories, setSelectedCategories,
    selectedGender, setSelectedGender,
    inStock, setInStock,
    showMobileFilters, setShowMobileFilters,
    availableSizes,
    availableColors,
    availableCategories,
    filteredProducts,
    activeFilters,
    clearAllFilters,
  };
}
