import Hero from "@/components/Hero";
// import TrustBar from "@/components/TrustBar";
// import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivals from "@/components/NewArrivals";
import BestSellers from "@/components/BestSellers";
// import PromotionalBanners from "@/components/PromotionalBanners";
import RecommendedForYou from "@/components/RecommendedForYou";
import TopStoresCarousel from "@/components/TopStoresCarousel";
import ExploreProducts from "@/components/ExploreProducts";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import NewsletterSection from "@/components/NewsletterSection";

export default function Home() {
  return (
    <main>
      <Hero />                    {/* 1. Hook — mood cards + banner, sets the vibe */}
      <NewArrivals />             {/* 2. Freshness — "what just dropped", keeps them curious */}
      <BestSellers />             {/* 3. Social proof — "others are buying this", builds confidence */}
      <RecommendedForYou />       {/* 4. Personalization — relevant picks while interest is high */}
      <TopStoresCarousel />       {/* 5. Trust — verified sellers, deepens platform credibility */}
      <ExploreProducts />         {/* 6. Depth — broad browse for those still exploring */}
      <RecentlyViewedProducts />  {/* 7. Re-engagement — reminds them what caught their eye */}
      <NewsletterSection />       {/* 8. Capture — last touchpoint before they leave */}
    </main>
  );
}