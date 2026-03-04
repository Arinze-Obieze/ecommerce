'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FiChevronLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export function ProductDetailClient({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [user, setUser] = useState(null);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { addToCart } = useCart();
  const supabase = createClient();

  const [variants, setVariants] = useState([]);
  
  // Fetch product details and variants
  useEffect(() => {
    const fetchProductAndVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Parallel fetch
        const [prodRes, varRes] = await Promise.all([
             fetch(`/api/products/${id}`),
             fetch(`/api/products/${id}/variants`)
        ]);

        const prodData = await prodRes.json();
        
        if (!prodRes.ok) {
          setError(prodData.error || 'Failed to load product');
          return;
        }
        setProduct(prodData);

        // Handle variants
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

    if (id) {
      fetchProductAndVariants();
      // Check auth state for reviews
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      
      return () => subscription.unsubscribe();
    }
  }, [id, supabase.auth]);

  const handleAddToCart = () => {
    setActionError('');
    // 1. Check if product has variants (either via fetched variants OR if product has sizes/colors defined in arrays)
    const hasVariants = variants.length > 0 || (product.sizes?.length > 0) || (product.colors?.length > 0);
    
    let selectedVariantId = null;

    if (hasVariants) {
        if (!selectedSize && product.sizes?.length > 0) {
            setActionError('Please select a size.');
            return;
        }
        if (!selectedColor && product.colors?.length > 0) {
            setActionError('Please select a color.');
            return;
        }

        // Find matching variant if we have structured variants
        if (variants.length > 0) {
            const match = variants.find(v => 
                (!v.size || v.size === selectedSize) && 
                (!v.color || v.color === selectedColor)
            );
            
            if (!match) {
                setActionError('Selected combination is not available.');
                return;
            }
            if (match.stock_quantity <= 0) {
                 setActionError('Selected combination is out of stock.');
                 return;
            }
            selectedVariantId = match.id;
        }
    }


    addToCart({
        ...product,
        quantity,
        selectedSize,
        selectedColor,
        variant_id: selectedVariantId
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

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

      // Update local product reviews list to show it immediately
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.discount_price
    ? product.discount_price / 100
    : product.price / 100;
  const originalPrice = product.price / 100;
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Products
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <img
                src={product.image_urls?.[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Sale Badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                  -{discount}%
                </div>
              )}

              {/* Video Badge or Placeholder if needed */}
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {/* Favorite Button */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FiHeart
                    className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                  title="Share Product"
                >
                  <FiShare2 className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Video Section */}
            {product.video_urls && product.video_urls.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Video</h3>
                <video
                  src={product.video_urls[0]}
                  controls
                  className="w-full rounded-lg bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.sku && (
                <div className="text-sm text-gray-500 mb-2 font-medium">
                  SKU: {product.sku}
                </div>
              )}

              {/* Store Info */}
              {product.stores && (
                <div className="mb-3">
                  <span className="text-sm text-gray-500 mr-2">Sold by:</span>
                  <Link 
                    href={`/store/${product.stores.slug || product.stores.id}`}
                    className="text-sm font-bold text-gray-900 hover:underline hover:text-blue-600"
                  >
                    {product.stores.name}
                  </Link>
                </div>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-blue-600">
                  ${displayPrice.toFixed(2)}
                </span>
                {product.discount_price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {/* Calculate dynamic stock based on selection */}
                {(() => {
                    let currentStock = product.stock_quantity;
                    if (variants.length > 0) {
                        if (selectedSize || selectedColor) {
                             const match = variants.find(v => 
                                (!v.size || v.size === selectedSize) && 
                                (!v.color || v.color === selectedColor)
                            );
                            if (match) currentStock = match.stock_quantity;
                        } else {
                            // If variants exist but nothing selected, maybe show total or range? 
                            // For simplicity, keep product.stock_quantity as fallback or sum of variants
                             currentStock = variants.reduce((acc, v) => acc + v.stock_quantity, 0);
                        }
                    }

                    return (
                        <>
                            <div
                            className={`w-3 h-3 rounded-full ${
                                currentStock > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            />
                            <span
                            className={`text-sm font-medium ${
                                currentStock > 0 ? 'text-green-700' : 'text-red-700'
                            }`}
                            >
                            {currentStock > 0
                                ? `${currentStock} in stock`
                                : 'Out of stock'}
                            </span>
                        </>
                    );
                })()}
              </div>
            </div>

            {/* Product Tabs have been moved to below the main grid */}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Color: <span className="font-normal text-gray-600">{selectedColor || 'None'}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => {
                    const getColorHex = (name) => {
                      const lowerName = name.toLowerCase();
                      const colors = {
                        'navy blue': '#1e3a8a',
                        'green': '#166534',
                        'red': '#991b1b',
                        'dark grey': '#374151',
                        'black': '#000000',
                        'white': '#ffffff',
                        'gray': '#6b7280',
                        'grey': '#6b7280',
                        'blue': '#2563eb',
                        'yellow': '#eab308',
                        'orange': '#f97316',
                        'purple': '#9333ea',
                        'pink': '#ec4899',
                        'brown': '#78350f',
                        'beige': '#f5f5dc',
                        'light blue': '#bfdbfe',
                        'light green': '#bbf7d0',
                        'dark blue': '#1e3a8a',
                        'dark green': '#14532d',
                        'dark red': '#7f1d1d',
                      };
                      return colors[lowerName] || lowerName.replace(/\s+/g, '');
                    };
                    
                    const hexCode = getColorHex(color);
                    const isSelected = selectedColor === color;
                    // Determine if the checkmark should be black based on background lightness
                    const isLightColor = ['white', '#ffffff', '#fff', 'yellow', 'beige', '#eab308', '#f5f5dc'].includes(hexCode.toLowerCase());
                    
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-blue-600'
                            : 'ring-1 ring-gray-200 hover:ring-gray-300 ring-offset-1'
                        }`}
                        style={{ backgroundColor: hexCode }}
                      >
                        {isSelected && (
                          <FiCheck className={`w-5 h-5 ${isLightColor ? 'text-gray-900' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-l border-r border-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={(() => {
                    if (variants.length > 0) {
                      const match = variants.find(v =>
                        (!v.size || v.size === selectedSize) &&
                        (!v.color || v.color === selectedColor)
                      );
                      if (!match) return true;
                      return quantity >= Math.max(0, Number(match.stock_quantity) || 0);
                    }
                    return quantity >= Math.max(0, Number(product.stock_quantity) || 0);
                  })()}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {actionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {addedToCart ? (
                <>
                  <FiCheck className="w-6 h-6" />
                  Added to Cart
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-6 h-6" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Note: Share button was moved to the image gallery */}

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-gray-900">Free on orders over $50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Returns:</span>
                <span className="font-medium text-gray-900">30-day return policy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warranty:</span>
                <span className="font-medium text-gray-900">1-year warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Full width below the product grid) */}
        <div className="mt-16 border rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b overflow-x-auto scbar-hide">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors whitespace-nowrap min-w-max ${
                activeTab === 'description'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors whitespace-nowrap min-w-max ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors whitespace-nowrap min-w-max ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700">
                {product.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="text-gray-700">
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assuming specifications could be an array of objects or strings, or a plain text field. Assuming text with newlines or an array for now. */}
                    {typeof product.specifications === 'string' 
                      ? product.specifications.split('\n').map((spec, i) => (
                          <div key={i} className="py-2 border-b border-gray-100 last:border-0">{spec}</div>
                        ))
                      : Array.isArray(product.specifications) 
                        ? product.specifications.map((spec, i) => (
                            <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                                {typeof spec === 'object' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-medium text-gray-900">{spec.key}</span>
                                        <span className="text-gray-600">{spec.value}</span>
                                    </div>
                                ) : spec}
                            </div>
                          ))
                        : Object.entries(product.specifications).map(([key, val], i) => (
                            <div key={i} className="py-2 border-b border-gray-100 last:border-0 grid grid-cols-2 gap-2">
                                <span className="font-medium text-gray-900">{key}</span>
                                <span className="text-gray-600">{val}</span>
                            </div>
                          ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                             {/* Initials placeholder if we don't have user profiles */}
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
                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500 italic mb-2">No reviews yet.</p>
                        <p className="text-gray-700 font-medium">Be the first to review this product!</p>
                    </div>
                  )}
                </div>
                
                {/* Write Review Form */}
                <div className="md:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h4>
                    {!user ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-600 mb-4">Please log in to share your thoughts about this product.</p>
                        <Link href="/signin" className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                            Sign In
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Rating</label>
                          <div className="flex gap-1 bg-white p-3 rounded-lg border border-gray-200 w-fit">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <svg 
                                  className={`w-7 h-7 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current hover:text-yellow-200'}`} 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium text-gray-900 mb-2">Your Review</label>
                          <textarea
                            id="comment"
                            rows="5"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="What did you like or dislike? What should other shoppers know before buying?"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm resize-y"
                            required
                          />
                        </div>
                        {reviewError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{reviewError}</p>}
                        {submitSuccess && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 font-medium">Thank you! Your review was submitted successfully.</p>}
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className={`w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors shadow-sm ${
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

        {/* Related Products Section (Optional) */}
        {product.categories && product.categories.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More from {product.categories[0].name}
            </h2>
            <Link
              href={`/shop?category=${product.categories[0].slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Category
              <FiChevronLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
