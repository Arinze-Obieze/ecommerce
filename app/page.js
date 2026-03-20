 import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivals from "@/components/NewArrivals";
import BestSellers from "@/components/BestSellers";
import PromotionalBanners from "@/components/PromotionalBanners";
import TopStoresCarousel from "@/components/TopStoresCarousel";
import ExploreProducts from "@/components/ExploreProducts";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import Testimonials from "@/components/Testimonials";
import NewsletterSection from "@/components/NewsletterSection";

export default function Home() {
  return (
    <main>
      <Hero />                    {/* 1. Hook — big visual, CTA */}
      <TrustBar />                {/* 2. Credibility — before they scroll away */}
      <FeaturedCategories />      {/* 3. Navigate — help them find their world */}
      <NewArrivals />             {/* 4. Freshness — show the store is alive */}
      <BestSellers />             {/* 5. Social proof — what others are buying */}
      <PromotionalBanners />      {/* 6. Urgency — deals after desire is built */}
      <TopStoresCarousel />       {/* 7. Marketplace — surface trusted sellers */}
      <ExploreProducts />         {/* 8. Depth — broad catalogue browse */}
      <RecentlyViewedProducts />  {/* 9. Re-engagement — personal reminder */}
      <NewsletterSection />       {/* 11. Capture — last thing before they leave */}
    </main>
  );
}