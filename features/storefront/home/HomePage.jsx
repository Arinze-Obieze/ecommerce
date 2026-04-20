import Hero from '@/components/storefront/home/Hero';
import TrustBar from '@/components/storefront/home/TrustBar';
import FeaturedCategories from '@/components/storefront/home/FeaturedCategories';
import NewArrivals from '@/components/storefront/home/NewArrivals';
import BestSellers from '@/components/storefront/home/BestSellers';
import PromotionalBanners from '@/components/storefront/home/PromotionalBanners';
import TopStoresCarousel from '@/components/storefront/home/TopStoresCarousel';
import RecommendedForYou from '@/components/storefront/home/RecommendedForYou';
import ExploreProducts from '@/components/storefront/home/ExploreProducts';
import RecentlyViewedProducts from '@/components/catalog/RecentlyViewedProducts';
import NewsletterSection from '@/components/storefront/home/NewsletterSection';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <FeaturedCategories />
      <NewArrivals />
      <BestSellers />
      <PromotionalBanners />
      <TopStoresCarousel />
      <RecommendedForYou />
      <ExploreProducts />
      <RecentlyViewedProducts />
      <NewsletterSection />
    </main>
  );
}
