"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function SellerProductsPage() {
  const router = useRouter();
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        const { data: stores } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);

        if (!stores || stores.length === 0) {
            setLoading(false);
            return;
        }

        // Fetch products for this store
        // For V1 UI scaffolding, we inject some Dummy Data so the user can see the table layout
        // Next, this will actually hit the real DB.
        setProducts([
            { id: 1, name: 'Vintage Leather Jacket', price: 45000, stock: 12, status: 'Active', category: 'Men', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100' },
            { id: 2, name: 'Kids Denim Overalls', price: 15000, stock: 0, status: 'Out of Stock', category: 'Baby & Kids', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=100' },
            { id: 3, name: 'Midnight Silk Dress', price: 89000, stock: 5, status: 'Active', category: 'Mood', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100' }
        ]);

      } catch (err) {
        console.error(err);
        toastError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [router, toastError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E5C45]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your catalog, pricing, and inventory.</p>
        </div>
        <Link 
           href="/seller/products/new"
           className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2E5C45] text-white font-semibold rounded-xl hover:bg-[#254a38] transition-colors shadow-sm shrink-0"
        >
           <FiPlus /> Add Product
        </Link>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         {products.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                 <p className="text-lg font-medium text-gray-900 mb-2">No products found</p>
                 <p className="mb-6">You haven't added any products to your store yet.</p>
                 <Link 
                    href="/seller/products/new"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                 >
                    <FiPlus /> Create your first listing
                 </Link>
             </div>
         ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500">Product</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500">Category</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500">Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500">Stock</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500">Status</th>
                    <th className="px-4 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                               <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-semibold text-gray-900">{product.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">₦{product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                         <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                            {product.stock}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-[#2E5C45] rounded-md hover:bg-[#2E5C45]/10" title="View in store">
                               <FiEye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Edit">
                               <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50" title="Delete">
                               <FiTrash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         )}
      </div>

    </div>
  );
}
