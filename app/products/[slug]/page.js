"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

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

  // Unwrap params for Next.js 15
  const { slug } = React.use(params);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const currentPrice = product.discount_price || product.price;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#2E5C45] mb-8 transition-colors"
        >
          <FiChevronLeft className="mr-1" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {product.image_urls?.length > 1 && (
                <div className="hidden lg:flex flex-col gap-3 order-first">
                  {product.image_urls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#2E5C45]' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 flex justify-center">
                <div className="aspect-3/4 bg-gray-100 rounded-2xl overflow-hidden relative w-full max-w-[450px] shadow-sm">
                  <img
                    src={product.image_urls?.[selectedImage] || 'https://placehold.co/600x800'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {product.image_urls?.length > 1 && (
              <div className="lg:hidden flex gap-3 overflow-x-auto pb-2">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-32 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[#2E5C45]' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="mb-2 text-[#2E5C45] font-medium text-sm tracking-wide">
              {product.category?.name || 'Collection'}
            </div>

            <div className="flex justify-between items-start gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-red-50 text-red-500'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FiHeart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">({product.reviews_count || 124} reviews)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-gray-900">
                ₦{currentPrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="text-xl text-gray-400 line-through">
                  ₦{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {product.stores && (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-5 mb-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {product.stores.logo_url ? (
                      <img
                        src={product.stores.logo_url}
                        alt={product.stores.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[#2E5C45] flex items-center justify-center text-white font-bold text-xl">
                        {product.stores.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Sold by</p>
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
                      {product.stores.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(product.stores.rating || 4.5) ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">{(product.stores.rating || 4.5).toFixed(1)}</span>
                    </div>
                  </div>

                  <a
                    href={`/store/${product.stores.slug || product.stores.id}`}
                    className="shrink-0 px-4 py-2.5 bg-white border border-gray-300 text-gray-900 font-semibold text-sm rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                  >
                    Visit Store
                  </a>
                </div>
              </div>
            )}

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description || 'Experience premium comfort and style with this essential piece. Crafted from high-quality materials for durability and a perfect fit.'}
            </p>

            <div className="space-y-6 mb-10">
              {sizeOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 h-12 px-4 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
                          selectedSize === size
                            ? 'border-[#2E5C45] bg-[#2E5C45] text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-900'
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 px-4 rounded-full text-sm font-medium border transition-all ${
                          selectedColor === color
                            ? 'border-[#2E5C45] bg-[#2E5C45] text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-900'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200 w-fit">
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
      </div>
    </div>
  );
}
