'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart/CartContext';
import { useWishlist } from '@/contexts/wishlist/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import { DEFAULT_RETURN_POLICY } from '@/utils/catalog/return-policy';
import { calculateBulkPricing, getBulkDiscountTiers } from '@/utils/catalog/bulk-pricing';
import { logProductEvent } from '@/utils/telemetry/product-events';
import {
  buildGalleryMedia,
  getSpecificationEntries,
  getUniqueOptions,
  pickDefaultVariant,
  useIsDesktop,
} from '@/features/catalog/product-detail/productDetail.utils';

export default function useProductDetailPage(params) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const supabase = useMemo(() => createClient(), []);
  const isDesktop = useIsDesktop();
  const hasLoggedView = useRef(false);

  const [product, setProduct] = useState(null);
  const [returnPolicy, setReturnPolicy] = useState(DEFAULT_RETURN_POLICY);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [openSection, setOpenSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState('');
  const [addedAnim, setAddedAnim] = useState(false);

  const { slug } = React.use(params);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user || null));
    return () => subscription?.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const [productResponse, variantsResponse] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache: 'no-store' }),
          fetch(`/api/products/${slug}/variants`, { cache: 'no-store' }),
        ]);
        const productData = await productResponse.json();
        const variantsData = await variantsResponse.json();
        if (!productResponse.ok) throw new Error(productData.error);

        const fetchedVariants = Array.isArray(variantsData?.variants) ? variantsData.variants : [];
        setProduct(productData);
        setReturnPolicy(productData.return_policy || DEFAULT_RETURN_POLICY);
        setVariants(fetchedVariants);

        if (!hasLoggedView.current) {
          hasLoggedView.current = true;
          logProductEvent({ productId: productData.id, eventType: 'view', source: 'product_page', metadata: { referrer: document.referrer || null } });
        }

        try {
          const views = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
          localStorage.setItem('recently_viewed_products', JSON.stringify([productData.id, ...views.filter((id) => id !== productData.id)].slice(0, 15)));
        } catch {}

        const defaultVariant = pickDefaultVariant(fetchedVariants);
        if (defaultVariant) {
          setSelectedSize(defaultVariant.size || null);
          setSelectedColor(defaultVariant.color || null);
        } else {
          setSelectedSize(productData.sizes?.[0] || null);
          setSelectedColor(productData.colors?.[0] || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [slug]);

  const sizeOptions = useMemo(() => {
    const options = getUniqueOptions(variants, 'size');
    return options.length ? options : Array.isArray(product?.sizes) ? product.sizes : [];
  }, [variants, product]);

  const colorOptions = useMemo(() => {
    const options = getUniqueOptions(variants, 'color');
    return options.length ? options : Array.isArray(product?.colors) ? product.colors : [];
  }, [variants, product]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find((variant) => {
      const sizeMatches = sizeOptions.length ? variant.size === selectedSize : true;
      const colorMatches = colorOptions.length ? variant.color === selectedColor : true;
      return sizeMatches && colorMatches;
    }) || null;
  }, [variants, sizeOptions.length, colorOptions.length, selectedSize, selectedColor]);

  const effectiveStock = selectedVariant ? Number(selectedVariant.stock_quantity) || 0 : Number(product?.stock_quantity) || 0;
  const selectedVariantLabel = [selectedVariant?.color || selectedColor, selectedVariant?.size || selectedSize].filter(Boolean).join(' / ');
  const requiresVariant = variants.length > 0;
  const canAddToCart = requiresVariant ? Boolean(selectedVariant) && effectiveStock > 0 : effectiveStock > 0;
  const galleryMedia = useMemo(() => buildGalleryMedia(product), [product]);
  const specEntries = useMemo(() => getSpecificationEntries(product?.specifications), [product?.specifications]);
  const pricingProduct = useMemo(() => selectedVariant ? { ...product, price: selectedVariant.price ?? product?.price } : product, [product, selectedVariant]);
  const bulkPricing = useMemo(() => calculateBulkPricing(pricingProduct, quantity), [pricingProduct, quantity]);
  const bulkTiers = useMemo(() => getBulkDiscountTiers(product), [product]);
  const baseDiscPct = product?.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : null;
  const currentPrice = bulkPricing.finalUnitPrice;
  const compareAtPrice = bulkPricing.hasBulkDiscount ? bulkPricing.baseUnitPrice : product?.discount_price ? product.price : null;
  const activeDiscPct = bulkPricing.hasBulkDiscount ? bulkPricing.appliedTier?.discount_percent : baseDiscPct;
  const inWishlist = product ? isInWishlist(product.id) : false;
  const storeName = product?.stores?.name || product?.store?.name || 'Trusted seller';
  const promotions = Array.isArray(product?.promotions) ? product.promotions : [];

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = { title: product?.name, text: product?.description?.slice(0, 100), url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied!');
      } catch {}
    }
  }, [product, showToast]);

  const handleAddToCart = useCallback(() => {
    if (!canAddToCart) return;
    addToCart({
      ...product,
      variant_id: selectedVariant?.id || null,
      stock_quantity: effectiveStock,
      selectedSize: selectedVariant?.size || selectedSize,
      selectedColor: selectedVariant?.color || selectedColor,
      quantity,
    });
    setAddedAnim(true);
    showToast('Added to cart!');
    setTimeout(() => setAddedAnim(false), 1800);
  }, [canAddToCart, product, selectedVariant, effectiveStock, selectedSize, selectedColor, quantity, addToCart, showToast]);

  const handleReviewAdded = useCallback((review) => {
    setProduct((current) => ({ ...current, reviews: [review, ...(current.reviews || [])] }));
  }, []);

  return {
    router,
    product,
    returnPolicy,
    variants,
    loading,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    quantity,
    setQuantity,
    activeTab,
    setActiveTab,
    openSection,
    setOpenSection,
    user,
    toast,
    addedAnim,
    isDesktop,
    galleryMedia,
    specEntries,
    bulkPricing,
    bulkTiers,
    currentPrice,
    compareAtPrice,
    activeDiscPct,
    inWishlist,
    toggleWishlist,
    storeName,
    promotions,
    sizeOptions,
    colorOptions,
    selectedVariant,
    effectiveStock,
    selectedVariantLabel,
    requiresVariant,
    canAddToCart,
    handleShare,
    handleAddToCart,
    handleReviewAdded,
    cartLabel: !canAddToCart ? (requiresVariant && !selectedVariant ? 'Select Options' : 'Out of Stock') : addedAnim ? '✓ Added!' : 'Add to Cart',
    sectionProps: { product, user, onReviewAdded: handleReviewAdded, storeName, specEntries, returnPolicy, selectedVariantLabel, isDesktop },
    calculateTierPricing: (minimumQuantity) => calculateBulkPricing(product, minimumQuantity).finalUnitPrice,
  };
}
