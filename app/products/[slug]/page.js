"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiMinus, FiPlus, FiShare2 } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

function getUniqueOptions(variants, key) {
  return [...new Set((variants || []).map((variant) => variant?.[key]).filter(Boolean))];
}

function pickDefaultVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  return variants.find((variant) => Number(variant.stock_quantity) > 0) || variants[0];
}

export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const { slug } = React.use(params);

  const [activeTab, setActiveTab] = useState('description');
  const [user, setUser] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription?.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, variantsRes] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache: 'no-store' }),
          fetch(`/api/products/${slug}/variants`, { cache: 'no-store' }),
        ]);

        const productData = await productRes.json();
        const variantsData = await variantsRes.json();

        if (!productRes.ok) {
          throw new Error(productData.error || 'Failed to fetch product');
        }

        const fetchedVariants = Array.isArray(variantsData?.variants)
          ? variantsData.variants
          : [];

        setProduct(productData);
        setVariants(fetchedVariants);

        const defaultVariant = pickDefaultVariant(fetchedVariants);
        if (defaultVariant) {
          setSelectedSize(defaultVariant.size || null);
          setSelectedColor(defaultVariant.color || null);
        } else {
          setSelectedSize(productData.sizes?.[0] || null);
          setSelectedColor(productData.colors?.[0] || null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const sizeOptions = useMemo(() => {
    const fromVariants = getUniqueOptions(variants, 'size');
    if (fromVariants.length > 0) return fromVariants;
    return Array.isArray(product?.sizes) ? product.sizes : [];
  }, [variants, product]);

  const colorOptions = useMemo(() => {
    const fromVariants = getUniqueOptions(variants, 'color');
    if (fromVariants.length > 0) return fromVariants;
    return Array.isArray(product?.colors) ? product.colors : [];
  }, [variants, product]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    const matches = variants.filter((variant) => {
      const sizeMatch = sizeOptions.length > 0 ? variant.size === selectedSize : true;
      const colorMatch = colorOptions.length > 0 ? variant.color === selectedColor : true;
      return sizeMatch && colorMatch;
    });

    return matches[0] || null;
  }, [variants, sizeOptions.length, colorOptions.length, selectedSize, selectedColor]);

  const effectiveStock = selectedVariant
    ? Number(selectedVariant.stock_quantity) || 0
    : Number(product?.stock_quantity) || 0;

  const requiresVariantSelection = variants.length > 0;
  const canAddToCart = requiresVariantSelection
    ? Boolean(selectedVariant) && effectiveStock > 0
    : effectiveStock > 0;

  const shortDescription = useMemo(() => {
      if (!product?.description) return '';
      // Simple truncation at last word boundary before 180 chars
      if (product.description.length <= 180) return product.description;
      const truncated = product.description.substring(0, 180);
      return truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(' '))) + '...';
  }, [product?.description]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const currentPrice = product.discount_price || product.price;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be logged in to review.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please enter a comment.');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setProduct(prev => ({
        ...prev,
        reviews: [{
          id: data.id || Date.now().toString(),
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment,
          created_at: new Date().toISOString()
        }, ...(prev.reviews || [])]
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
    // If we have a global site info somewhere we'd use it here, but typically we want to share the product url
    const shareData = {
      title: `${product?.name} | E-commerce Store`,
      text: `Check out ${product?.name}: ${product?.description ? product.description.substring(0, 100) + '...' : 'A great product!'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard if Web Share API is not supported (e.g. on Desktop)
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        showToast('Failed to copy link');
      }
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
           <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
           </svg>
           <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Mobile Top Navigation */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
              <FiChevronLeft className="mr-1 w-5 h-5" /> Back
            </button>
            
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm border ${
                  isInWishlist(product.id)
                    ? 'bg-red-50 border-red-100 text-red-500'
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
                title="Add to Wishlist"
              >
                <FiHeart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 shadow-sm transition-all"
                title="Share Product"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {product.image_urls?.length > 1 && (
                <div className="hidden lg:flex flex-col gap-3 order-first scbar-hide no-scrollbar max-h-[600px] overflow-y-auto pr-1">
                  {product.image_urls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#2E5C45] shadow-md' : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100 bg-white'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 flex justify-center w-full">
                <div className="aspect-3/4 bg-white rounded-3xl overflow-hidden relative w-full lg:max-w-xl shadow-xs border border-gray-100 group">
                  <img
                    src={product.image_urls?.[selectedImage] || 'https://placehold.co/600x800'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  />
                  {discountPercent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white font-black px-4 py-2 rounded-full text-sm shadow-lg tracking-wide">
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {product.image_urls?.length > 1 && (
              <div className="lg:hidden flex gap-3 overflow-x-auto pb-4 scbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[#2E5C45] shadow-sm' : 'border-transparent hover:border-gray-200 bg-white opacity-80'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#2E5C45]/10 text-[#2E5C45] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category?.name || 'Collection'}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-900">{Number(product.rating || 5).toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({product.reviews_count || 0} reviews)</span>
              </div>
            </div>

            <div className="flex justify-between items-start gap-4 mb-2">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-2">
                  {product.name}
                </h1>
                {product.sku && (
                  <div className="text-sm text-gray-500 font-medium">
                    SKU: {product.sku}
                  </div>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all border ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-100 text-red-500'
                      : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                  }`}
                  title="Add to Wishlist"
                >
                  <FiHeart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
                  title="Share Product"
                >
                  <FiShare2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-gray-900">
                ₦{currentPrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="text-xl text-gray-400 line-through font-medium mb-1">
                  ₦{product.price.toLocaleString()}
                </span>
              )}
            </div>
            
            {shortDescription && (
              <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                {shortDescription}
              </p>
            )}

            {product.stores && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {product.stores.logo_url ? (
                      <img
                        src={product.stores.logo_url}
                        alt={product.stores.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#2E5C45] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {product.stores.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-0.5">Seller</p>
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {product.stores.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                      <FiStar className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="text-gray-700">{(product.stores.rating || 4.5).toFixed(1)} Rating</span>
                    </div>
                  </div>

                  <a
                    href={`/store/${product.stores.slug || product.stores.id}`}
                    className="shrink-0 px-5 py-2.5 bg-white border border-gray-300 text-gray-900 font-bold text-xs uppercase tracking-wide rounded-full hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Visit Store
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-6 mb-8 pt-6 border-t border-gray-100">
              {sizeOptions.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Select Size</h3>
                    {selectedSize && <span className="text-sm text-gray-500">{selectedSize}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 h-12 px-4 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          selectedSize === size
                            ? 'border-[#2E5C45] bg-[#2E5C45] text-white shadow-md shadow-[#2E5C45]/20'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colorOptions.length > 0 && (
                <div>
                   <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Select Color</h3>
                    {selectedColor && <span className="text-sm text-gray-500">{selectedColor}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-12 px-5 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedColor === color
                            ? 'border-[#2E5C45] bg-[#2E5C45] text-white shadow-md shadow-[#2E5C45]/20'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-200 w-fit h-14">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-all"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={effectiveStock > 0 ? quantity >= effectiveStock : true}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (!canAddToCart) return;

                  addToCart({
                    ...product,
                    variant_id: selectedVariant?.id || null,
                    stock_quantity: effectiveStock,
                    selectedSize: selectedVariant?.size || selectedSize,
                    selectedColor: selectedVariant?.color || selectedColor,
                    quantity,
                  });
                }}
                disabled={!canAddToCart}
                className={`flex-1 font-bold py-3 md:py-4 px-8 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 ${
                  canAddToCart
                    ? 'bg-[#2E5C45] text-white hover:bg-[#254a38] shadow-[#2E5C45]/20'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>
                  {!canAddToCart
                    ? (requiresVariantSelection && !selectedVariant ? 'Unavailable Variant' : 'Out of Stock')
                    : 'Add to Cart'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${effectiveStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {effectiveStock > 0
                  ? (
                    <span className="font-medium text-green-700">
                      {effectiveStock} units available
                      {effectiveStock < 10 && <span className="text-red-600 ml-1">(Running Low!)</span>}
                    </span>
                  )
                  : <span className="font-medium text-red-600">Currently Out of Stock</span>
                }
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚚</span>
                Free Delivery over ₦50k
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Full width below the product grid) */}
        <div className="mt-12 md:mt-20 border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-xs">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 overflow-x-auto scbar-hide">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-5 px-6 text-center font-bold text-sm transition-all whitespace-nowrap min-w-max relative ${
                activeTab === 'description'
                  ? 'text-[#2E5C45]'
                  : 'text-gray-500 hover:text-gray-900 bg-gray-50/50'
              }`}
            >
              Full Description
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E5C45]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`flex-1 py-5 px-6 text-center font-bold text-sm transition-all whitespace-nowrap min-w-max relative ${
                activeTab === 'specifications'
                  ? 'text-[#2E5C45]'
                  : 'text-gray-500 hover:text-gray-900 bg-gray-50/50'
              }`}
            >
              Specifications
              {activeTab === 'specifications' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E5C45]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-5 px-6 text-center font-bold text-sm transition-all whitespace-nowrap min-w-max relative ${
                activeTab === 'reviews'
                  ? 'text-[#2E5C45]'
                  : 'text-gray-500 hover:text-gray-900 bg-gray-50/50'
              }`}
            >
              Reviews ({product.reviews?.length || 0})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E5C45]" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="italic text-gray-500">No description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="text-gray-700">
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typeof product.specifications === 'string' 
                      ? product.specifications.split('\n').map((spec, i) => (
                          <div key={i} className="py-3 border-b border-gray-100 last:border-0">{spec}</div>
                        ))
                      : Array.isArray(product.specifications) 
                        ? product.specifications.map((spec, i) => (
                            <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                                {typeof spec === 'object' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-semibold text-gray-900">{spec.key}</span>
                                        <span className="text-gray-600">{spec.value}</span>
                                    </div>
                                ) : spec}
                            </div>
                          ))
                        : Object.entries(product.specifications).map(([key, val], i) => (
                            <div key={i} className="py-3 border-b border-gray-100 last:border-0 grid grid-cols-2 gap-2">
                                <span className="font-semibold text-gray-900">{key}</span>
                                <span className="text-gray-600">{val}</span>
                            </div>
                          ))
                    }
                  </div>
                ) : (
                  <p className="italic text-gray-500">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl border border-gray-200">
                               👤
                            </div>
                            <div>
                              <div className="flex text-yellow-400 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 font-medium">{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-100">
                        <p className="text-gray-500 mb-2">No reviews yet.</p>
                        <p className="text-gray-900 font-bold text-lg">Be the first to review this product!</p>
                    </div>
                  )}
                </div>
                
                {/* Write Review Form */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 sticky top-28">
                    <h4 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h4>
                    {!user ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-600 mb-6">Please log in to share your thoughts about this product.</p>
                        <Link href="/login" className="inline-block px-8 py-3 bg-[#2E5C45] text-white rounded-full hover:bg-[#254a38] transition-colors font-bold text-sm shadow-md">
                            Sign In to Review
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-3">Rating</label>
                          <div className="flex gap-2 bg-white p-3 rounded-xl border border-gray-200 w-fit">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <svg 
                                  className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current hover:text-yellow-200'}`} 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="comment" className="block text-sm font-bold text-gray-900 mb-3">Your Review</label>
                          <textarea
                            id="comment"
                            rows="5"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="What did you like or dislike? What should other shoppers know before buying?"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E5C45] focus:border-transparent text-sm resize-y shadow-sm"
                            required
                          />
                        </div>
                        {reviewError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{reviewError}</p>}
                        {submitSuccess && <p className="text-sm text-[#2E5C45] bg-[#2E5C45]/10 p-3 rounded-lg border border-[#2E5C45]/20 font-bold">Thank you! Your review was submitted successfully.</p>}
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className={`w-full py-4 bg-[#2E5C45] text-white rounded-full hover:bg-[#254a38] font-bold text-sm transition-all shadow-md ${
                            isSubmittingReview ? 'opacity-70 cursor-wait' : ''
                          }`}
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
