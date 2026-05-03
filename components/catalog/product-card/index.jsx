'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMinus, FiPlus, FiShoppingCart, FiTrendingUp, FiX, FiZoomIn } from 'react-icons/fi';
import { useCart } from '@/contexts/cart/CartContext';
import { trackAnalyticsEvent } from '@/utils/telemetry/analytics';
import { logProductEvent } from '@/utils/telemetry/product-events';
import { RankBadge, TrendingBadge } from './ProductBadges';
import ProductCardPricing from './ProductCardPricing';
import PromotionTags from './PromotionTags';
import QuickAddButton from './QuickAddButton';

function formatSales(count) {
  if (!count && count !== 0) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

const QUICK_VIEW_DESCRIPTION_LIMIT = 180;
const DEFAULT_PROMO_THEME = {
  '--promo-badge-bg': 'var(--zova-ink)',
  '--promo-badge-text': 'var(--zova-linen)',
  '--promo-tag-bg': '#F472B6',
  '--promo-tag-text': '#FFFFFF',
};

function ProductCard({ product, source = 'unknown', position = null }) {
  const { addToCart } = useCart();
  const [cartState, setCartState] = useState('idle');
  const [variantOptions, setVariantOptions] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState('');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [showQuickView, setShowQuickView] = useState(false);
  const [isQuickViewDescriptionExpanded, setIsQuickViewDescriptionExpanded] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const panStateRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 });

  const promotions = Array.isArray(product.promotions) ? product.promotions : [];
  const zovaPromo = promotions.find((promotion) => promotion.owner_type === 'zova') || null;
  const sellerPromo = promotions.find((promotion) => promotion.owner_type === 'seller') || null;
  const primaryPromo = zovaPromo || sellerPromo;
  const secondaryPromo = zovaPromo && sellerPromo ? sellerPromo : null;

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const salesFormatted = formatSales(product.total_sales);
  const description = String(product.description || '').trim();
  const hasLongDescription = description.length > QUICK_VIEW_DESCRIPTION_LIMIT;
  const quickViewDescription = hasLongDescription && !isQuickViewDescriptionExpanded
    ? `${description.slice(0, QUICK_VIEW_DESCRIPTION_LIMIT).trimEnd()}...`
    : description;
  const promoTheme = primaryPromo ? {
    ...DEFAULT_PROMO_THEME,
    '--promo-badge-bg': primaryPromo.badge_bg_color || 'var(--zova-ink)',
    '--promo-badge-text': primaryPromo.badge_text_color || 'var(--zova-linen)',
    '--promo-tag-bg': primaryPromo.tag_bg_color || '#F472B6',
    '--promo-tag-text': primaryPromo.tag_text_color || '#FFFFFF',
  } : null;

  const sharedMeta = {
    ...(position !== null && { position }),
    category: product.categories?.[0]?.slug || product.categories?.[0]?.name || null,
    price: Number(product.discount_price || product.price || 0),
    has_discount: !!product.discount_price,
    is_trending: !!product.is_trending,
    store_id: product.stores?.id || product.store_id || null,
  };
  const hasVariantChoices = (Array.isArray(product.sizes) && product.sizes.length > 0) || (Array.isArray(product.colors) && product.colors.length > 0);
  const secondaryImage = product.image_urls?.[1] || null;
  const sizeOptions = useMemo(
    () => [...new Set((variantOptions.length ? variantOptions.map((variant) => variant.size) : product.sizes || []).filter(Boolean))],
    [product.sizes, variantOptions]
  );
  const colorOptions = useMemo(
    () => [...new Set((variantOptions.length ? variantOptions.map((variant) => variant.color) : product.colors || []).filter(Boolean))],
    [product.colors, variantOptions]
  );
  const selectedVariant = useMemo(() => {
    if (!variantOptions.length) return null;
    return variantOptions.find((variant) => {
      const sizeMatches = sizeOptions.length ? variant.size === selectedSize : true;
      const colorMatches = colorOptions.length ? variant.color === selectedColor : true;
      return sizeMatches && colorMatches;
    }) || null;
  }, [colorOptions.length, selectedColor, selectedSize, sizeOptions.length, variantOptions]);

  const handleProductClick = () => {
    trackAnalyticsEvent('product_card_click', {
      product_id: product.id,
      product_name: product.name,
      store_id: sharedMeta.store_id,
      price: sharedMeta.price,
      category: sharedMeta.category,
    });
    logProductEvent({ productId: product.id, eventType: 'click', source, metadata: sharedMeta });
  };

  const resetCartStateSoon = () => {
    window.setTimeout(() => setCartState('idle'), 2000);
  };

  const addConfiguredProductToCart = (variant = null, via = 'card_button') => {
    addToCart({
      ...product,
      variant_id: variant?.id || null,
      stock_quantity: variant?.stock_quantity ?? product.stock_quantity,
      selectedSize: variant?.size || selectedSize || null,
      selectedColor: variant?.color || selectedColor || null,
    });
    setCartState('added');
    setQuickAddOpen(false);
    resetCartStateSoon();
    logProductEvent({ productId: product.id, eventType: 'cart_add', source, metadata: { ...sharedMeta, quantity: 1, via } });
  };

  const loadVariantOptions = async () => {
    if (variantOptions.length > 0 || variantLoading || !product.slug) return;

    setVariantLoading(true);
    setVariantError('');
    try {
      const response = await fetch(`/api/products/${product.slug || product.id}/variants`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Could not load product options.');
      }
      const nextVariants = Array.isArray(json?.variants) ? json.variants : [];
      setVariantOptions(nextVariants);
      if (!selectedSize && nextVariants[0]?.size) setSelectedSize(nextVariants[0].size);
      if (!selectedColor && nextVariants[0]?.color) setSelectedColor(nextVariants[0].color);
    } catch (error) {
      setVariantError(error.message || 'Could not load product options.');
    } finally {
      setVariantLoading(false);
    }
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hasVariantChoices) {
      addConfiguredProductToCart(null, 'card_button');
      return;
    }

    // product has variants — open quick view modal instead of inline panel
    setIsQuickViewDescriptionExpanded(false);
    setShowQuickView(true);
    await loadVariantOptions();
    logProductEvent({ productId: product.id, eventType: 'view', source: 'quick_view', metadata: sharedMeta });
  };

  const handleQuickViewAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addConfiguredProductToCart(selectedVariant, 'quick_view');
    setShowQuickView(false);
  };

  const handleOpenQuickView = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsQuickViewDescriptionExpanded(false);
    setShowQuickView(true);
    if (hasVariantChoices) {
      await loadVariantOptions();
    }
    logProductEvent({ productId: product.id, eventType: 'view', source: 'quick_view', metadata: sharedMeta });
  };

  useEffect(() => {
    if (!showQuickView && !showImageViewer) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      if (showImageViewer) {
        setShowImageViewer(false);
        setImageZoom(1);
      } else {
        setShowQuickView(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showQuickView, showImageViewer]);

  useEffect(() => {
    if (imageZoom <= 1) {
      setImageOffset({ x: 0, y: 0 });
      setIsPanningImage(false);
    }
  }, [imageZoom]);

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setImageZoom(1);
    setImageOffset({ x: 0, y: 0 });
    setIsPanningImage(false);
  };

  const openImageViewer = () => {
    setShowImageViewer(true);
    setImageZoom(1);
    setImageOffset({ x: 0, y: 0 });
  };

  const handleImagePointerDown = (event) => {
    if (imageZoom <= 1) return;

    event.preventDefault();
    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: imageOffset.x,
      originY: imageOffset.y,
    };
    setIsPanningImage(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleImagePointerMove = (event) => {
    if (!isPanningImage || panStateRef.current.pointerId !== event.pointerId) return;

    setImageOffset({
      x: panStateRef.current.originX + (event.clientX - panStateRef.current.startX),
      y: panStateRef.current.originY + (event.clientY - panStateRef.current.startY),
    });
  };

  const handleImagePointerUp = (event) => {
    if (panStateRef.current.pointerId !== event.pointerId) return;

    setIsPanningImage(false);
    panStateRef.current.pointerId = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <>
      <div className="zova-panel group flex h-full flex-col overflow-hidden rounded-[18px] border border-(--zova-border) bg-white shadow-[0_1px_3px_rgba(25,27,25,0.06)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(25,27,25,0.10)]">
        <Link href={`/products/${product.slug}`} className="relative block shrink-0" onClick={handleProductClick}>
          <div className="relative aspect-3/4 overflow-hidden bg-(--zova-linen)">
            <Image
              src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {secondaryImage ? (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="absolute inset-0 object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
              />
            ) : null}

            <div className="absolute inset-0 z-10 flex items-end justify-center pb-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="rounded-full border border-(--zova-border) bg-white px-5 py-2 text-xs font-semibold text-(--zova-ink) shadow-lg transition-colors hover:bg-(--zova-linen)"
              >
                Quick View
              </button>
            </div>

            <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
              {product.is_featured ? (
                <span className="rounded-sm bg-(--zova-ink) px-2 py-0.5 text-[11px] font-bold tracking-wide text-(--zova-linen)">
                  NEW
                </span>
              ) : null}

              {discountPercent && !primaryPromo ? (
                <span className="rounded-sm bg-[#C0392B] px-2 py-0.5 text-[11px] font-bold text-white">
                  -{discountPercent}%
                </span>
              ) : null}
            </div>

            {product.is_trending ? (
              <div className="absolute right-2.5 top-2.5 z-10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-sm" title="Trending">
                  🔥
                </span>
              </div>
            ) : null}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-2 px-3 pb-3.5 pt-3 sm:px-3.5 sm:pb-4 sm:pt-3.5">
          <p className="line-clamp-1 text-[11px] uppercase tracking-widest text-(--zova-text-muted)">
            {product.categories?.[0]?.name || 'Collection'}
          </p>

          <Link href={`/products/${product.slug}`} onClick={handleProductClick}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-(--zova-ink) hover:underline">
              {product.name}
            </h3>
          </Link>

          <ProductCardPricing
            price={product.price}
            discountPrice={product.discount_price}
            discountPercent={discountPercent}
            promo={primaryPromo}
          />

          <div className="flex h-5 items-center gap-1">
            {primaryPromo ? (
              <div className="contents" style={promoTheme}>
                <span className="inline-flex items-center rounded-sm bg-(--promo-badge-bg) px-2 py-0.5 text-[11px] font-black leading-none tracking-wide text-(--promo-badge-text)">
                  {primaryPromo.owner_type === 'seller' ? (
                    <span className="mr-1 h-1.5 w-1.5 shrink-0 rounded-full bg-(--promo-badge-text) opacity-50" />
                  ) : null}
                  {primaryPromo.display_name}
                </span>

                {primaryPromo.display_tag ? (
                  <span className="inline-flex items-center rounded-full bg-(--promo-tag-bg) px-2 py-0.5 text-[11px] font-semibold leading-none text-(--promo-tag-text)">
                    {primaryPromo.display_tag}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {product.is_trending || product.category_rank ? (
            <div className="flex flex-wrap gap-1">
              {product.is_trending ? <TrendingBadge velocity={product.trending_velocity} /> : null}
              {product.category_rank ? <RankBadge rank={product.category_rank} /> : null}
            </div>
          ) : null}

          {salesFormatted ? (
            <div className="flex items-center gap-1.5 rounded-md bg-(--zova-linen) px-2 py-1">
              <FiTrendingUp className="h-3 w-3 shrink-0 text-(--zova-primary-action)" />
              <span className="text-[11px] text-(--zova-text-muted)">
                <span className="font-semibold text-(--zova-ink)">{salesFormatted}</span> sold
              </span>
              {product.store_is_trending ? (
                <>
                  <span className="text-(--zova-border)">·</span>
                  <span className="text-[11px] text-[#b87800]">🔥 Hot store</span>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="flex-1" />

          <div className="flex items-center justify-between gap-2 pt-1.5">
            {product.stores ? (
              <Link
                href={`/store/${product.stores.slug || product.stores.id}`}
                onClick={(event) => event.stopPropagation()}
                className="min-w-0 flex-1"
              >
                <span className="block truncate text-[11px] text-(--zova-text-muted) transition-colors hover:text-(--zova-ink)">
                  {product.store_is_trending ? <span className="mr-1 text-[#b87800]">●</span> : null}
                  {product.stores.name}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            <QuickAddButton
              cartState={cartState}
              onClick={handleAddToCart}
              label={hasVariantChoices ? 'Preview' : 'Add to Cart'}
            />
          </div>


        </div>
      </div>

      {showQuickView ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-3 pt-[116px] sm:items-center sm:p-4"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="max-h-[calc(100vh-128px)] w-full max-w-2xl overflow-hidden rounded-b-[22px] rounded-t-[28px] bg-white shadow-2xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full shrink-0 bg-(--zova-linen) aspect-3/4max-h-[38vh] sm:w-[42%]">
                <button
                  type="button"
                  onClick={openImageViewer}
                  className="block h-full w-full cursor-zoom-in"
                >
                  <img
                    src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
                    alt={product.name}
                    className="h-full w-full object-contain px-[14px] pt-[14px] sm:object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={openImageViewer}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-(--zova-ink) shadow-sm backdrop-blur"
                >
                  <FiZoomIn className="h-3.5 w-3.5" /> Zoom
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-col gap-3 overflow-y-auto px-5 pb-4 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-1.5 w-12 rounded-full bg-(--zova-border) sm:hidden" />
                    <button
                      type="button"
                      onClick={() => setShowQuickView(false)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-(--zova-text-muted) transition-colors hover:bg-(--zova-linen)"
                    >
                      <FiX className="h-4 w-4" /> Close
                    </button>
                  </div>

                  <p className="text-[11px] uppercase tracking-widest text-(--zova-text-muted)">
                    {product.categories?.[0]?.name || 'Collection'}
                  </p>

                  <h2 className="text-[15px] font-bold leading-snug text-(--zova-ink) sm:text-lg">
                    {product.name}
                  </h2>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-black text-(--zova-ink)">
                      ₦{(product.discount_price || product.price).toLocaleString()}
                    </span>
                    {product.discount_price ? (
                      <span className="text-sm text-[#BBBBBB] line-through">
                        ₦{product.price.toLocaleString()}
                      </span>
                    ) : null}
                    {discountPercent ? (
                      <span className="rounded-sm bg-[#C0392B] px-2 py-0.5 text-xs font-bold text-white">
                        -{discountPercent}%
                      </span>
                    ) : null}
                  </div>

                  {primaryPromo ? (
                    <div className="space-y-1.5">
                      <PromotionTags promo={primaryPromo} price={product.price} />
                      {secondaryPromo ? <PromotionTags promo={secondaryPromo} price={product.price} /> : null}
                    </div>
                  ) : null}

                  {product.is_trending || product.category_rank ? (
                    <div className="flex flex-wrap gap-1.5">
                      {product.is_trending ? <TrendingBadge velocity={product.trending_velocity} /> : null}
                      {product.category_rank ? <RankBadge rank={product.category_rank} /> : null}
                    </div>
                  ) : null}

                  {salesFormatted ? (
                    <p className="text-xs text-(--zova-text-muted)">
                      <span className="font-semibold text-(--zova-ink)">{salesFormatted}</span> units sold
                    </p>
                  ) : null}

                  {product.stores ? (
                    <p className="text-xs text-(--zova-text-muted)">
                      Sold by <span className="font-semibold text-(--zova-ink)">{product.stores.name}</span>
                    </p>
                  ) : null}

                  {description ? (
                    <div className="rounded-xl border border-(--zova-border) bg-(--zova-linen) p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--zova-text-muted)">
                        Description
                      </p>
                      <p className="mt-2 text-sm leading-6 text-(--zova-text-muted)">
                        {quickViewDescription}
                      </p>
                      {hasLongDescription ? (
                        <button
                          type="button"
                          onClick={() => setIsQuickViewDescriptionExpanded((current) => !current)}
                          className="mt-2 text-sm font-semibold text-(--zova-ink)"
                        >
                          {isQuickViewDescriptionExpanded ? 'Read less' : 'Read more'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {hasVariantChoices ? (
                    <div className="space-y-3 rounded-2xl border border-(--zova-border) bg-(--zova-linen) p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-(--zova-text-muted)">
                        Select options
                      </p>

                      {variantLoading ? (
                        <p className="text-xs text-(--zova-text-muted)">Loading available options...</p>
                      ) : null}
                      {variantError ? (
                        <p className="text-xs text-[var(--zova-error,#C0392B)]">{variantError}</p>
                      ) : null}

                      {!variantLoading ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {colorOptions.length > 0 ? (
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold text-(--zova-text-muted)">Color</span>
                              <select
                                value={selectedColor}
                                onChange={(event) => setSelectedColor(event.target.value)}
                                className="w-full rounded-xl border border-(--zova-border) bg-white px-3 py-2 text-sm text-(--zova-ink) outline-none"
                              >
                                {colorOptions.map((color) => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                            </label>
                          ) : null}

                          {sizeOptions.length > 0 ? (
                            <label className="space-y-1">
                              <span className="text-[11px] font-semibold text-(--zova-text-muted)">Size</span>
                              <select
                                value={selectedSize}
                                onChange={(event) => setSelectedSize(event.target.value)}
                                className="w-full rounded-xl border border-(--zova-border) bg-white px-3 py-2 text-sm text-(--zova-ink) outline-none"
                              >
                                {sizeOptions.map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </label>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex-1" />

                  <div className="flex gap-2 pt-1">
                    <QuickAddButton
                      cartState={cartState}
                      onClick={handleQuickViewAddToCart}
                      fullWidth
                      label={hasVariantChoices ? 'Add to Cart' : 'Add to Cart'}
                      disabled={hasVariantChoices && variantOptions.length > 0 && !selectedVariant}
                    />
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setShowQuickView(false)}
                      className="flex items-center whitespace-nowrap rounded-xl border border-(--zova-border) px-4 py-3 text-sm font-semibold text-(--zova-ink) transition-colors hover:bg-(--zova-linen)"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showImageViewer ? (
        <div
          className="fixed inset-0 z-[130] bg-[rgba(25,27,25,0.95)]"
          onClick={closeImageViewer}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-4 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-white/70">
                  {imageZoom > 1 ? 'Drag the image to inspect details.' : 'Use the zoom controls below for a closer look.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageViewer}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold"
              >
                <FiX className="h-4 w-4" /> Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4" onClick={(event) => event.stopPropagation()}>
              <div className="flex min-h-full items-center justify-center">
                <img
                  src={product.image_urls?.[0] || 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.name}
                  className="max-h-[82vh] max-w-full w-auto object-contain transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageZoom})`,
                    transformOrigin: 'center center',
                    cursor: imageZoom > 1 ? (isPanningImage ? 'grabbing' : 'grab') : 'zoom-in',
                    touchAction: imageZoom > 1 ? 'none' : 'auto',
                  }}
                  onPointerDown={handleImagePointerDown}
                  onPointerMove={handleImagePointerMove}
                  onPointerUp={handleImagePointerUp}
                  onPointerCancel={handleImagePointerUp}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-4 pb-5" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setImageZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}
                disabled={imageZoom <= 1}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <FiMinus className="h-4 w-4" /> Zoom Out
              </button>
              <span className="min-w-[68px] text-center text-sm font-semibold text-white">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setImageZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))))}
                disabled={imageZoom >= 3}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <FiPlus className="h-4 w-4" /> Zoom In
              </button>
              {imageZoom > 1 || imageOffset.x !== 0 || imageOffset.y !== 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageZoom(1);
                    setImageOffset({ x: 0, y: 0 });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function areEqual(prevProps, nextProps) {
  return (
    prevProps.product?.id === nextProps.product?.id
    && prevProps.product?.updated_at === nextProps.product?.updated_at
    && prevProps.source === nextProps.source
    && prevProps.position === nextProps.position
  );
}

export default memo(ProductCard, areEqual);
