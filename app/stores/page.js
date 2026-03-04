import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { FiStar, FiUsers, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';

export const metadata = {
  title: 'Top Stores | ShopHub',
  description: 'Discover the best and highest-rated stores on ShopHub',
};

export default async function StoresPage() {
  const supabase = await createClient();
  
  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .eq('status', 'active')
    .order('rating', { ascending: false })
    .order('followers', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Top Rated Stores</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our most trusted verified sellers offering the best products and customer experience.</p>
        </div>
        
        {error ? (
          <div className="text-center text-red-500 p-8 bg-white rounded-xl border border-red-100">Failed to load stores: {error.message}</div>
        ) : stores?.length === 0 ? (
          <div className="text-center text-gray-500 p-8 bg-white rounded-xl">No active stores found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <Link key={store.id} href={`/store/${store.slug}`} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{store.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 ">
                        <h2 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#2E5C45] transition-colors">{store.name}</h2>
                        {store.kyc_status === 'verified' && (
                          <FiCheckCircle className="text-blue-500 w-4 h-4 shrink-0" title="Verified Store" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">{store.description || 'Welcome to our store. We offer high quality products.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <FiStar className="text-yellow-600 w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="font-semibold text-gray-900">{store.rating || 'New'}</span>
                      {store.rating && <span className="text-gray-500">Rating</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{store.followers || 0}</span>
                      <span>Followers</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
