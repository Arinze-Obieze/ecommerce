"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiMinus, FiPlus, FiShare2 } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { createClient } from '@/utils/supabase/client';

export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  
  // Unwrap params for Next.js 15
  const { slug } = React.use(params);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_categories(categories(*))')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        
        // Flatten category for easier access
        const productData = {
            ...data,
            category: data.product_categories?.[0]?.categories
        };

        setProduct(productData);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const currentPrice = product.discount_price || product.price;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#2E5C45] mb-8 transition-colors"
        >
          <FiChevronLeft className="mr-1" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative max-w-[450px] lg:max-w-[480px] w-full mx-auto shadow-sm">
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
            
            {/* Thumbnails */}
            {product.image_urls?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[#2E5C45]' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="mb-2 text-[#2E5C45] font-medium text-sm tracking-wide">
              {product.category?.name || "Collection"}
            </div>
            
            <div className="flex justify-between items-start gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                  isInWishlist(product.id)
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FiHeart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Rating */}
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

            {/* Price */}
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

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description || "Experience premium comfort and style with this essential piece. Crafted from high-quality materials for durability and a perfect fit."}
            </p>

            {/* Selectors (Mocked if data missing, or use actual if enabled in DB) */}
            <div className="space-y-6 mb-10">
                {/* Sizes */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                    <div className="flex flex-wrap gap-3">
                        {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
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
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                {/* Quantity */}
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
                         className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                </div>

                {/* Add to Cart */}
                <button
                    onClick={() => {
                        addToCart({ ...product, selectedSize, quantity });
                    }}
                    className="flex-1 bg-[#2E5C45] text-white font-bold py-3 md:py-4 px-8 rounded-full shadow-lg shadow-[#2E5C45]/20 hover:bg-[#254a38] transition-all flex items-center justify-center gap-2"
                >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                </button>

                {/* Wishlist */}

            </div>
            
            {/* Trust/Info Badges */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    In Stock & Ready to Ship
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
