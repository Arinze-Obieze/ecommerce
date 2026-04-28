import { Suspense } from 'react';
import RecentlyViewedProducts from '@/components/catalog/RecentlyViewedProducts';
import NewsletterSection from '@/components/storefront/home/NewsletterSection';
import {
  getBestSellerProductsServer,
  getExploreProductsServer,
  getHeroBannerServer,
  getNewArrivalProductsServer,
  getRecommendedProductsServer,
  getTopStoresServer,
} from '@/features/storefront/home/api/server';
import {
  BestSellersSection,
  CarouselSectionFallback,
  ExploreFallback,
  ExploreSection,
  HeroFallback,
  HeroSection,
  NewArrivalsSection,
  RecommendedSection,
  TopStoresFallback,
  TopStoresSection,
} from '@/features/storefront/home/HomePageSections';

export default function HomePage() {
  const heroPromise = getHeroBannerServer();
  const bestSellersPromise = getBestSellerProductsServer(8);
  const newArrivalsPromise = getNewArrivalProductsServer(8);
  const recommendedPromise = getRecommendedProductsServer(10);
  const topStoresPromise = getTopStoresServer(8);
  const explorePromise = getExploreProductsServer(12);

  return (
    <main>
      <Suspense fallback={<HeroFallback />}>
        <HeroSection promise={heroPromise} />
      </Suspense>

      <Suspense fallback={<CarouselSectionFallback title="Best Sellers" />}>
        <BestSellersSection promise={bestSellersPromise} />
      </Suspense>

      <Suspense fallback={<CarouselSectionFallback title="New Arrivals" />}>
        <NewArrivalsSection promise={newArrivalsPromise} />
      </Suspense>

      <Suspense fallback={<CarouselSectionFallback title="Recommended For You" />}>
        <RecommendedSection promise={recommendedPromise} />
      </Suspense>

      <Suspense fallback={<TopStoresFallback />}>
        <TopStoresSection promise={topStoresPromise} />
      </Suspense>

      <Suspense fallback={<ExploreFallback />}>
        <ExploreSection promise={explorePromise} />
      </Suspense>

      <RecentlyViewedProducts />
      <NewsletterSection />
    </main>
  );
}
