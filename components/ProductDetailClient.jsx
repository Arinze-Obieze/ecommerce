'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  FiChevronLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck,
  FiStar, FiPackage, FiShield, FiRefreshCw, FiTruck, FiChevronRight
} from 'react-icons/fi';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getColorHex as getCatalogColorHex, isLightHex } from '@/lib/color-utils';

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  pageBg:           "#F9FAFB",
  white:            "#FFFFFF",

  // Nav bar
  navBg:            "#FFFFFF",
  navBorder:        "#F0F0F0",
  navBack:          "#111111",
  navBackHover:     "#00B86B",

  // Text
  headingText:      "#111111",
  bodyText:         "#555555",
  mutedText:        "#999999",
  labelText:        "#444444",

  // Price
  priceBg:          "#F9FAFB",
  priceBorder:      "#F0F0F0",
  priceText:        "#111111",
  originalPrice:    "#CCCCCC",
  discountBg:       "#E53935",
  discountText:     "#FFFFFF",

  // Stock
  inStockDot:       "#00B86B",
  inStockText:      "#0A3D2E",
  outStockDot:      "#E53935",
  outStockText:     "#7F1D1D",

  // Categories
  catBg:            "#EDFAF3",
  catText:          "#0A3D2E",
  catBorder:        "#A8DFC4",
  catHover:         "#D5F5E8",

  // Store link
  storeText:        "#888888",
  storeName:        "#111111",
  storeHover:       "#00B86B",

  // Size chips
  sizeDefault:      "#FFFFFF",
  sizeBorder:       "#E0E0E0",
  sizeText:         "#333333",
  sizeSelected:     "#111111",
  sizeSelectedText: "#FFFFFF",
  sizeHover:        "#F5F5F5",

  // Color chip ring
  colorSelected:    "#00B86B",
  colorUnselected:  "#E0E0E0",

  // Qty stepper
  qtyBorder:        "#E0E0E0",
  qtyBg:            "#FFFFFF",
  qtyText:          "#111111",
  qtyBtnHover:      "#F5F5F5",

  // Add to cart button
  cartBg:           "#00B86B",
  cartHover:        "#0F7A4F",
  cartText:         "#FFFFFF",
  cartSuccessBg:    "#0A3D2E",
  cartDisabled:     "#E0E0E0",
  cartDisabledText: "#AAAAAA",

  // Wishlist button
  wishBorder:       "#E0E0E0",
  wishBg:           "#FFFFFF",
  wishHover:        "#FFF5F5",
  wishActive:       "#FF3B3B",

  // Error / success banners
  errorBg:          "#FFF5F5",
  errorBorder:      "#FFC5C5",
  errorText:        "#CC0000",
  successBg:        "#EDFAF3",
  successBorder:    "#A8DFC4",
  successText:      "#0A3D2E",

  // Info strip
  infoBg:           "#F9FAFB",
  infoBorder:       "#F0F0F0",
  infoIcon:         "#00B86B",
  infoLabel:        "#888888",
  infoValue:        "#333333",

  // Thumbnails
  thumbBorder:      "#E0E0E0",
  thumbSelected:    "#111111",

  // Tabs
  tabText:          "#888888",
  tabActive:        "#111111",
  tabActiveBar:     "#00B86B",
  tabBorder:        "#F0F0F0",
  tabHover:         "#F5F5F5",

  // Reviews
  reviewDivider:    "#F5F5F5",
  avatarBg:         "#F0F0F0",
  avatarText:       "#999999",
  starFill:         "#F59E0B",
  starEmpty:        "#E5E7EB",

  // Review form
  formBg:           "#F9FAFB",
  formBorder:       "#F0F0F0",
  inputBorder:      "#E0E0E0",
  inputFocus:       "#00B86B",
  submitBg:         "#111111",
  submitHover:      "#333333",
  submitText:       "#FFFFFF",

  // Related section
  relatedBorder:    "#F0F0F0",
  relatedBtn:       "#111111",
  relatedBtnText:   "#FFFFFF",
  relatedBtnHover:  "#333333",
};
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

const COLOR_MAP = {
  'navy blue': '#1e3a8a', 'green': '#166534', 'red': '#991b1b',
  'dark grey': '#374151', 'black': '#000000', 'white': '#ffffff',
  'gray': '#6b7280', 'grey': '#6b7280', 'blue': '#2563eb',
  'yellow': '#eab308', 'orange': '#f97316', 'purple': '#9333ea',
  'pink': '#ec4899', 'brown': '#78350f', 'beige': '#f5f5dc',
  'light blue': '#bfdbfe', 'light green': '#bbf7d0',
  'dark blue': '#1e3a8a', 'dark green': '#14532d', 'dark red': '#7f1d1d',
};
function getColorHex(name, hex) {
  return hex || COLOR_MAP[name.toLowerCase()] || getCatalogColorHex(name);
}

function StarRow({ rating, size = 'sm' }) {
  const px = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={px}
          style={{ color: i < rating ? THEME.starFill : THEME.starEmpty, fill: i < rating ? THEME.starFill : 'none' }}
        />
      ))}
    </div>
  );
}

// ── Loading state ─────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.pageBg }}>
      <div className="h-14" style={{ backgroundColor: THEME.navBg, borderBottom: `1px solid ${THEME.navBorder}` }} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl animate-pulse" style={{ backgroundColor: '#F0F0F0' }} />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ backgroundColor: '#F0F0F0', animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[180, 60, 90, 80, 60, 56].map((h, i) => (
              <div key={i} className="rounded-xl animate-pulse" style={{ height: h, backgroundColor: '#F0F0F0', animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────
function ErrorState({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME.pageBg }}>
      <div className="text-center px-4">
        <p className="text-5xl mb-4">🛍️</p>
        <h2 className="text-xl font-bold mb-2" style={{ color: THEME.headingText }}>Product not found</h2>
        <p className="text-sm mb-6" style={{ color: THEME.mutedText }}>{message}</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
          style={{ backgroundColor: THEME.cartBg, color: THEME.cartText }}
        >
          <FiChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function ProductDetailClient({ id }) {
  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity]           = useState(1);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [isFavorite, setIsFavorite]       = useState(false);
  const [actionError, setActionError]     = useState('');
  const [activeTab, setActiveTab]         = useState('description');
  const [user, setUser]                   = useState(null);
  const [variants, setVariants]           = useState([]);

  const [reviewRating, setReviewRating]         = useState(5);
  const [reviewComment, setReviewComment]       = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError]           = useState('');
  const [submitSuccess, setSubmitSuccess]       = useState(false);

  const { addToCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [prodRes, varRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products/${id}/variants`),
        ]);
        const prodData = await prodRes.json();
        if (!prodRes.ok) { setError(prodData.error || 'Failed to load product'); return; }
        setProduct(prodData);
        if (varRes.ok) {
          const varData = await varRes.json();
          if (varData.variants) setVariants(varData.variants);
        }
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [id, supabase.auth]);

  const currentStock = (() => {
    if (!product) return 0;
    if (variants.length > 0) {
      if (selectedSize || selectedColor) {
        const match = variants.find(v =>
          (!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)
        );
        return match ? match.stock_quantity : 0;
      }
      return variants.reduce((acc, v) => acc + v.stock_quantity, 0);
    }
    return product.stock_quantity || 0;
  })();

  const handleAddToCart = () => {
    setActionError('');
    const hasVariants = variants.length > 0 || product.sizes?.length > 0 || product.colors?.length > 0;
    let selectedVariantId = null;

    if (hasVariants) {
      if (!selectedSize && product.sizes?.length > 0) { setActionError('Please select a size.'); return; }
      if (!selectedColor && product.colors?.length > 0) { setActionError('Please select a colour.'); return; }
      if (variants.length > 0) {
        const match = variants.find(v =>
          (!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)
        );
        if (!match) { setActionError('This combination is not available.'); return; }
        if (match.stock_quantity <= 0) { setActionError('Selected combination is out of stock.'); return; }
        selectedVariantId = match.id;
      }
    }

    addToCart({ ...product, quantity, selectedSize, selectedColor, variant_id: selectedVariantId });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { setReviewError('You must be logged in to review.'); return; }
    if (!reviewComment.trim()) { setReviewError('Please enter a comment.'); return; }
    setIsSubmittingReview(true);
    setReviewError('');
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setProduct(prev => ({
        ...prev,
        reviews: [{
          id: data.id || Date.now().toString(),
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment,
          created_at: new Date().toISOString(),
        }, ...(prev.reviews || [])],
      }));
      setReviewComment('');
      setReviewRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, text: product?.description, url: window.location.href }); }
      catch (err) { console.error('Share failed:', err); }
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !product) return <ErrorState message={error} />;

  const displayPrice  = (product.discount_price || product.price) / 100;
  const originalPrice = product.price / 100;
  const discount      = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const TABS = [
    { key: 'description',    label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'reviews',        label: `Reviews (${product.reviews?.length || 0})` },
  ];
  const colorMeta = new Map((variants || [])
    .filter((variant) => variant?.color)
    .map((variant) => [variant.color, {
      color_hex: variant.color_hex || null,
      color_family: variant.color_family || null,
      color_source: variant.color_source || null,
    }]));

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.pageBg }}>

      {/* ── Sticky nav bar ── */}
      <div
        className="sticky top-0 z-20"
        style={{ backgroundColor: THEME.navBg, borderBottom: `1px solid ${THEME.navBorder}` }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group"
            style={{ color: THEME.navBack }}
            onMouseEnter={(e) => (e.currentTarget.style.color = THEME.navBackHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = THEME.navBack)}
          >
            <FiChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Shop
          </Link>

          {/* Breadcrumb on desktop */}
          {product.categories?.[0] && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: THEME.mutedText }}>
              <Link href="/shop" className="hover:underline">Shop</Link>
              <FiChevronRight className="w-3 h-3" />
              <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:underline">
                {product.categories[0].name}
              </Link>
              <FiChevronRight className="w-3 h-3" />
              <span style={{ color: THEME.labelText }} className="font-medium truncate max-w-[180px]">{product.name}</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* ── Left: image gallery ── */}
          <div className="space-y-3">

            {/* Main image */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ backgroundColor: '#F5F5F5', aspectRatio: '1/1' }}
            >
              <img
                src={product.image_urls?.[selectedImage] || 'https://placehold.co/800x800?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-200"
              />

              {/* Discount badge */}
              {discount > 0 && (
                <span
                  className="absolute top-4 left-4 text-xs font-black px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: THEME.discountBg, color: THEME.discountText }}
                >
                  -{discount}%
                </span>
              )}

              {/* Action buttons — top right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsFavorite(f => !f)}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  style={{
                    backgroundColor: THEME.wishBg,
                    border: `1px solid ${THEME.wishBorder}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.wishHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.wishBg)}
                >
                  <FiHeart
                    className="w-4 h-4"
                    style={{ color: isFavorite ? THEME.wishActive : '#888', fill: isFavorite ? THEME.wishActive : 'none' }}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  style={{ backgroundColor: THEME.wishBg, border: `1px solid ${THEME.wishBorder}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.wishBg)}
                >
                  <FiShare2 className="w-4 h-4" style={{ color: '#888' }} />
                </button>
              </div>

              {/* Image counter dot nav */}
              {product.image_urls?.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {product.image_urls.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: selectedImage === i ? 20 : 6,
                        height: 6,
                        backgroundColor: selectedImage === i ? THEME.cartBg : 'rgba(255,255,255,0.7)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.image_urls?.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className="aspect-square rounded-xl overflow-hidden transition-all"
                    style={{
                      border: `2px solid ${selectedImage === idx ? THEME.thumbSelected : THEME.thumbBorder}`,
                    }}
                  >
                    <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {product.video_urls?.[0] && (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${THEME.navBorder}` }}>
                <video src={product.video_urls[0]} controls className="w-full bg-black" />
              </div>
            )}
          </div>

          {/* ── Right: product info ── */}
          <div className="flex flex-col gap-5">

            {/* Category chips + store */}
            <div className="flex flex-wrap items-center gap-2">
              {product.categories?.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors"
                  style={{ backgroundColor: THEME.catBg, color: THEME.catText, border: `1px solid ${THEME.catBorder}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.catHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.catBg)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Name */}
            <div>
              <h1 className="text-2xl font-black leading-snug" style={{ color: THEME.headingText }}>
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-xs mt-1" style={{ color: THEME.mutedText }}>SKU: {product.sku}</p>
              )}
            </div>

            {/* Store */}
            {product.stores && (
              <p className="text-sm" style={{ color: THEME.storeText }}>
                Sold by{' '}
                <Link
                  href={`/store/${product.stores.slug || product.stores.id}`}
                  className="font-bold transition-colors"
                  style={{ color: THEME.storeName }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = THEME.storeHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = THEME.storeName)}
                >
                  {product.stores.name}
                </Link>
              </p>
            )}

            {/* Price + stock */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: THEME.priceBg, border: `1px solid ${THEME.priceBorder}` }}
            >
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="text-3xl font-black" style={{ color: THEME.priceText }}>
                  ₦{displayPrice.toLocaleString()}
                </span>
                {product.discount_price && (
                  <span className="text-base line-through" style={{ color: THEME.originalPrice }}>
                    ₦{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentStock > 0 ? THEME.inStockDot : THEME.outStockDot }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: currentStock > 0 ? THEME.inStockText : THEME.outStockText }}
                >
                  {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: THEME.labelText }}>
                  Size {selectedSize && <span className="font-normal normal-case tracking-normal" style={{ color: THEME.mutedText }}>— {selectedSize}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    const selected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          backgroundColor: selected ? THEME.sizeSelected : THEME.sizeDefault,
                          color: selected ? THEME.sizeSelectedText : THEME.sizeText,
                          border: `1.5px solid ${selected ? THEME.sizeSelected : THEME.sizeBorder}`,
                        }}
                        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.backgroundColor = THEME.sizeHover; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = THEME.sizeDefault; }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selection */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: THEME.labelText }}>
                  Colour {selectedColor && <span className="font-normal normal-case tracking-normal" style={{ color: THEME.mutedText }}>— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(color => {
                    const meta = colorMeta.get(color);
                    const hex = getColorHex(color, meta?.color_hex);
                    const selected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => setSelectedColor(color)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: hex,
                          boxShadow: selected ? `0 0 0 2px white, 0 0 0 3.5px ${THEME.colorSelected}` : `0 0 0 1px ${THEME.colorUnselected}`,
                        }}
                      >
                        {selected && (
                          <FiCheck className="w-4 h-4" style={{ color: isLightHex(hex) ? '#111' : '#fff' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity stepper */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: THEME.labelText }}>Quantity</p>
              <div
                className="flex items-center rounded-xl overflow-hidden w-fit"
                style={{ border: `1.5px solid ${THEME.qtyBorder}`, backgroundColor: THEME.qtyBg }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors"
                  style={{ color: THEME.qtyText }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.qtyBtnHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  −
                </button>
                <span
                  className="w-10 text-center text-sm font-bold"
                  style={{ color: THEME.qtyText, borderLeft: `1px solid ${THEME.qtyBorder}`, borderRight: `1px solid ${THEME.qtyBorder}` }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={quantity >= currentStock}
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: THEME.qtyText }}
                  onMouseEnter={(e) => { if (quantity < currentStock) e.currentTarget.style.backgroundColor = THEME.qtyBtnHover; }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  +
                </button>
              </div>
            </div>

            {/* Error message */}
            {actionError && (
              <div
                className="text-sm px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: THEME.errorBg, border: `1px solid ${THEME.errorBorder}`, color: THEME.errorText }}
              >
                {actionError}
              </div>
            )}

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all duration-150"
              style={{
                backgroundColor: addedToCart ? THEME.cartSuccessBg : currentStock === 0 ? THEME.cartDisabled : THEME.cartBg,
                color: currentStock === 0 ? THEME.cartDisabledText : THEME.cartText,
                cursor: currentStock === 0 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (currentStock > 0 && !addedToCart) e.currentTarget.style.backgroundColor = THEME.cartHover; }}
              onMouseLeave={(e) => { if (currentStock > 0 && !addedToCart) e.currentTarget.style.backgroundColor = THEME.cartBg; }}
            >
              {addedToCart ? (
                <><FiCheck className="w-5 h-5" /> Added to Cart</>
              ) : (
                <><FiShoppingCart className="w-5 h-5" /> Add to Cart</>
              )}
            </button>

            {/* Info strip */}
            <div
              className="grid grid-cols-3 divide-x rounded-2xl overflow-hidden text-center text-xs"
              style={{ backgroundColor: THEME.infoBg, border: `1px solid ${THEME.infoBorder}`, borderColor: THEME.infoBorder }}
            >
              {[
                { icon: FiTruck,     label: 'Shipping',  value: 'Free over ₦50k' },
                { icon: FiRefreshCw, label: 'Returns',   value: '30 days' },
                { icon: FiShield,    label: 'Secure',    value: '100% Safe' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="py-3 px-2 flex flex-col items-center gap-1">
                  <Icon className="w-4 h-4" style={{ color: THEME.infoIcon }} />
                  <span className="font-bold" style={{ color: THEME.infoValue }}>{value}</span>
                  <span style={{ color: THEME.infoLabel }}>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Tabs (full width) ── */}
        <div
          className="mt-14 rounded-2xl overflow-hidden"
          style={{ backgroundColor: THEME.white, border: `1px solid ${THEME.tabBorder}` }}
        >
          {/* Tab headers */}
          <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${THEME.tabBorder}` }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-4 px-6 text-sm font-semibold whitespace-nowrap transition-colors relative"
                style={{ color: activeTab === tab.key ? THEME.tabActive : THEME.tabText }}
                onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = THEME.tabHover; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ backgroundColor: THEME.tabActiveBar }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">

            {/* Description */}
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                {product.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: THEME.bodyText }}>
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: THEME.mutedText }}>No description available.</p>
                )}
              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specifications' && (
              <div>
                {product.specifications ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 max-w-2xl divide-y" style={{ borderColor: THEME.reviewDivider }}>
                    {(typeof product.specifications === 'string'
                      ? product.specifications.split('\n').map((s, i) => ({ key: `Spec ${i + 1}`, value: s }))
                      : Array.isArray(product.specifications)
                        ? product.specifications.map(s => typeof s === 'object' ? s : { key: s, value: '' })
                        : Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
                    ).map(({ key, value }, i) => (
                      <div key={i} className="flex gap-4 py-3">
                        <span className="text-xs font-bold w-32 flex-shrink-0" style={{ color: THEME.labelText }}>{key}</span>
                        <span className="text-xs flex-1" style={{ color: THEME.bodyText }}>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic" style={{ color: THEME.mutedText }}>No specifications available.</p>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Review list */}
                <div className="md:col-span-2">
                  <h3 className="text-base font-black mb-5" style={{ color: THEME.headingText }}>
                    Customer Reviews
                    {product.reviews?.length > 0 && (
                      <span className="ml-2 text-sm font-normal" style={{ color: THEME.mutedText }}>
                        ({product.reviews.length})
                      </span>
                    )}
                  </h3>

                  {product.reviews?.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map(review => (
                        <div key={review.id} className="pb-6" style={{ borderBottom: `1px solid ${THEME.reviewDivider}` }}>
                          <div className="flex items-center gap-3 mb-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                              style={{ backgroundColor: THEME.avatarBg, color: THEME.avatarText }}
                            >
                              👤
                            </div>
                            <div>
                              <StarRow rating={review.rating} />
                              <span className="text-[11px]" style={{ color: THEME.mutedText }}>
                                {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: THEME.bodyText }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: THEME.priceBg }}>
                      <p className="text-3xl mb-2">⭐</p>
                      <p className="text-sm font-bold mb-1" style={{ color: THEME.headingText }}>No reviews yet</p>
                      <p className="text-xs" style={{ color: THEME.mutedText }}>Be the first to review this product</p>
                    </div>
                  )}
                </div>

                {/* Write a review */}
                <div className="md:col-span-1">
                  <div
                    className="rounded-2xl p-5 sticky top-20"
                    style={{ backgroundColor: THEME.formBg, border: `1px solid ${THEME.formBorder}` }}
                  >
                    <h4 className="text-sm font-black mb-4" style={{ color: THEME.headingText }}>Write a Review</h4>

                    {!user ? (
                      <div className="text-center py-6">
                        <p className="text-xs mb-4" style={{ color: THEME.mutedText }}>Sign in to share your experience</p>
                        <Link
                          href="/signin"
                          className="inline-block px-5 py-2.5 rounded-full text-sm font-bold"
                          style={{ backgroundColor: THEME.cartBg, color: THEME.cartText }}
                        >
                          Sign In
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="space-y-4">

                        {/* Star picker */}
                        <div>
                          <p className="text-xs font-bold mb-2" style={{ color: THEME.labelText }}>Rating</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <FiStar
                                  className="w-6 h-6"
                                  style={{
                                    color: star <= reviewRating ? THEME.starFill : THEME.starEmpty,
                                    fill: star <= reviewRating ? THEME.starFill : 'none',
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <p className="text-xs font-bold mb-2" style={{ color: THEME.labelText }}>Your Review</p>
                          <textarea
                            rows={5}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="What did you think? Help other shoppers decide…"
                            className="w-full px-3 py-2.5 rounded-xl text-xs resize-y outline-none transition-all"
                            style={{
                              border: `1.5px solid ${THEME.inputBorder}`,
                              color: THEME.bodyText,
                              backgroundColor: THEME.white,
                            }}
                            onFocus={(e) => (e.target.style.borderColor = THEME.inputFocus)}
                            onBlur={(e) => (e.target.style.borderColor = THEME.inputBorder)}
                            required
                          />
                        </div>

                        {reviewError && (
                          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: THEME.errorBg, color: THEME.errorText, border: `1px solid ${THEME.errorBorder}` }}>
                            {reviewError}
                          </p>
                        )}
                        {submitSuccess && (
                          <p className="text-xs px-3 py-2 rounded-lg font-semibold" style={{ backgroundColor: THEME.successBg, color: THEME.successText, border: `1px solid ${THEME.successBorder}` }}>
                            ✓ Review submitted — thank you!
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="w-full py-3 rounded-xl text-sm font-black transition-colors disabled:opacity-60 disabled:cursor-wait"
                          style={{ backgroundColor: THEME.submitBg, color: THEME.submitText }}
                          onMouseEnter={(e) => { if (!isSubmittingReview) e.currentTarget.style.backgroundColor = THEME.submitHover; }}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.submitBg)}
                        >
                          {isSubmittingReview ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related category ── */}
        {product.categories?.[0] && (
          <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${THEME.relatedBorder}` }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black" style={{ color: THEME.headingText }}>
                More from {product.categories[0].name}
              </h2>
              <Link
                href={`/shop?category=${product.categories[0].slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                style={{ backgroundColor: THEME.relatedBtn, color: THEME.relatedBtnText }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.relatedBtnHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = THEME.relatedBtn)}
              >
                View All <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
