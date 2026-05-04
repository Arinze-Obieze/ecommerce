import { Suspense } from 'react';
import StoresDirectory from '@/features/storefront/stores/StoresDirectory';

export const metadata = {
  title: 'Top Stores | ZOVA',
  description: 'Discover the best and highest-rated stores on ZOVA',
};

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-(--zova-linen) py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-(--zova-ink) mb-4 uppercase tracking-tight">Top Rated Stores</h1>
          <p className="text-(--zova-text-body) max-w-2xl mx-auto">Discover our most trusted verified sellers offering the best products and customer experience.</p>
        </div>

        <Suspense fallback={<div className="rounded-[4px] bg-white p-8 text-center text-(--zova-text-muted)">Loading stores...</div>}>
          <StoresDirectory />
        </Suspense>
      </div>
    </div>
  );
}
