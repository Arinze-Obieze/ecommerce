'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MOOD_META, MOOD_PRICE_PRESETS } from '@/features/storefront/mood/mood.constants';
import { filterMoodProducts, sortMoodProducts } from '@/features/storefront/mood/mood.utils';

export default function useMoodPage(slug) {
  const [mood, setMood] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('fit_desc');
  const [pricePreset, setPricePreset] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);
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
        .select(`mood_fit_score, products ( id, name, slug, price, discount_price, image_urls, rating, sizes, colors, stock_quantity, is_active, created_at, product_categories ( is_primary, categories ( id, name, slug, parent_id ) ) )`)
        .eq('mood_key', slug)
        .eq('is_active', true)
        .order('mood_fit_score', { ascending: false });

      if (tagsErr) {
        setError('Failed to load products.');
        setLoading(false);
        return;
      }

      setAllProducts(
        (tags || [])
          .filter((tag) => tag.products?.is_active === true)
          .map((tag) => {
            const product = tag.products;
            const category = product.product_categories?.find((entry) => entry.is_primary)?.categories;
            return {
              ...product,
              mood_fit_score: tag.mood_fit_score,
              category_name: category?.name || null,
              category_slug: category?.slug || null,
            };
          })
      );
      setLoading(false);
    })();
  }, [slug]);

  const availableSizes = useMemo(() => {
    const sizes = new Set();
    allProducts.forEach((product) => (product.sizes || []).forEach((size) => sizes.add(size)));
    return [...sizes].sort();
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    allProducts.forEach((product) => (product.colors || []).forEach((color) => colors.add(color)));
    return [...colors].sort();
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    const categories = new Map();
    allProducts.forEach((product) => {
      if (product.category_name && product.category_slug) {
        categories.set(product.category_slug, product.category_name);
      }
    });
    return [...categories.entries()].map(([categorySlug, name]) => ({ slug: categorySlug, name }));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = filterMoodProducts({
      products: allProducts,
      pricePreset,
      selectedSizes,
      selectedColors,
      selectedCategories,
    });
    return sortMoodProducts(filtered, sort);
  }, [allProducts, pricePreset, selectedSizes, selectedColors, selectedCategories, sort]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (pricePreset !== null) {
      filters.push({ key: 'price', label: MOOD_PRICE_PRESETS[pricePreset].label, clear: () => setPricePreset(null) });
    }
    selectedSizes.forEach((size) => filters.push({ key: `sz-${size}`, label: size, clear: () => setSelectedSizes((current) => current.filter((item) => item !== size)) }));
    selectedColors.forEach((color) => filters.push({ key: `cl-${color}`, label: color, clear: () => setSelectedColors((current) => current.filter((item) => item !== color)) }));
    selectedCategories.forEach((category) => {
      const name = availableCategories.find((item) => item.slug === category)?.name || category;
      filters.push({ key: `cat-${category}`, label: name, clear: () => setSelectedCategories((current) => current.filter((item) => item !== category)) });
    });
    return filters;
  }, [pricePreset, selectedSizes, selectedColors, selectedCategories, availableCategories]);

  const clearAllFilters = useCallback(() => {
    setPricePreset(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
  }, []);

  return {
    slug,
    mood,
    meta: MOOD_META[slug] || { emoji: '🛍️' },
    allProducts,
    loading,
    error,
    sort,
    setSort,
    pricePreset,
    setPricePreset,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    selectedCategories,
    setSelectedCategories,
    showMobileFilters,
    setShowMobileFilters,
    availableSizes,
    availableColors,
    availableCategories,
    filteredProducts,
    activeFilters,
    clearAllFilters,
  };
}
