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
      <Hero />                   {/* 1. Immediate impact & value prop */}
      <BestSellers />            {/* 2. Social proof while attention is high */}
      <NewArrivals />            {/* 3. Freshness to reward return visitors */}
      <RecommendedForYou />      {/* 4. Personalization drives engagement */}
      <TopStoresCarousel />      {/* 5. Brand discovery mid-scroll */}
      <ExploreProducts />        {/* 6. Broad browsing for undecided shoppers */}
      <RecentlyViewedProducts /> {/* 7. Re-engagement before exit */}
      <NewsletterSection />      {/* 8. Capture leads as a last touchpoint */}
    </main>
  );
}