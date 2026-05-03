import { Suspense } from 'react';
import RecentlyViewedProducts from '@/components/catalog/RecentlyViewedProducts';
import LazyExploreSection from '@/components/storefront/home/LazyExploreSection';
import NewsletterSection from '@/components/storefront/home/NewsletterSection';
import {
  getBestSellerProductsServer,
  getHeroBannerServer,
  getNewArrivalProductsServer,
  getRecommendedProductsServer,
  getTopStoresServer,
} from '@/features/storefront/home/api/server';
import {
  CarouselSectionFallback,
  HeroFallback,
  HeroSection,
  TrendingProductsSection,
  TopStoresFallback,
  TopStoresSection,
} from '@/features/storefront/home/HomePageSections';

export default function HomePage() {
  const heroPromise = getHeroBannerServer();
  const bestSellersPromise = getBestSellerProductsServer(8);
  const newArrivalsPromise = getNewArrivalProductsServer(8);
  const recommendedPromise = getRecommendedProductsServer(10);
  const topStoresPromise = getTopStoresServer(8);

  return (
    <main>
      <Suspense fallback={<HeroFallback />}>
        <HeroSection promise={heroPromise} />
      </Suspense>

      <LazyExploreSection />

      <Suspense fallback={<CarouselSectionFallback title="Trending Now" />}>
        <TrendingProductsSection 
          bestSellersPromise={bestSellersPromise}
          newArrivalsPromise={newArrivalsPromise}
          recommendedPromise={recommendedPromise}
        />
      </Suspense>

      <Suspense fallback={<TopStoresFallback />}>
        <TopStoresSection promise={topStoresPromise} />
      </Suspense>

      <RecentlyViewedProducts />
      <NewsletterSection />
    </main>
  );
}
