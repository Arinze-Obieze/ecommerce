import { Suspense } from 'react';
import StoresDirectory from '@/features/storefront/stores/StoresDirectory';

export const metadata = {
  title: 'Top Stores | ZOVA',
  description: 'Discover the best and highest-rated stores on ZOVA',
};

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Top Rated Stores</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our most trusted verified sellers offering the best products and customer experience.</p>
        </div>

        <Suspense fallback={<div className="rounded-xl bg-white p-8 text-center text-gray-500">Loading stores...</div>}>
          <StoresDirectory />
        </Suspense>
      </div>
    </div>
  );
}
