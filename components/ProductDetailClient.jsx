'use client';

import { useState, useEffect } from 'react';
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
  const { addToCart } = useCart();

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
    }
  }, [id]);

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

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiHeart
                  className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
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

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

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
                  Select Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
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

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-lg border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <FiShare2 className="w-5 h-5" />
              Share Product
            </button>

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
