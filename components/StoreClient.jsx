"use client"
import { useState, useEffect } from "react"
import Link from 'next/link';
import { FiUser, FiStar, FiGrid } from "react-icons/fi";
import ProductGrid from "./Shop/ProductGrid"

export default function StoreClient({ store }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Stats mocking based on SHEIN style
  const rating = store.rating || 4.8;
  const followers = store.followers || 0;
  const logoUrl = store.logo_url || "https://placehold.co/100x100?text=" + store.name.charAt(0);

  useEffect(() => {
    const fetchStoreProducts = async () => {
      try {
        setLoading(true);
        // Use the products API with storeId filter
        const res = await fetch(`/api/products?storeId=${store.id}&limit=24`);
        const data = await res.json();
        
        if (data.success) {
            setProducts(data.data);
        } else {
            setError(data.error || "Failed to load products");
        }
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (store.id) {
        fetchStoreProducts();
    }
  }, [store.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Logo */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                    <img 
                        src={logoUrl} 
                        alt={store.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
                    {store.description && (
                        <p className="text-gray-600 text-sm mb-3 max-w-2xl">{store.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                        <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <FiStar className="fill-current" />
                            <span>{rating} Rating</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <FiUser />
                            <span>{followers.toLocaleString()} Followers</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                           <FiGrid />
                           <span>{products.length} Products</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                        Follow
                    </button>
                    <button className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
                        Message
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Catalog */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">All Products</h2>
        
        <ProductGrid 
            products={products}
            loading={loading}
            error={error}
            // Simple pagination or infinite scroll could be added later
            onLoadMore={() => {}} 
        />
      </main>
    </div>
  )
}
