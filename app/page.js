import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivals from "@/components/NewArrivals";
import PromotionalBanners from "@/components/PromotionalBanners";
import TrustBar from "@/components/TrustBar";
import BestSellers from "@/components/BestSellers";
import ExploreProducts from "@/components/ExploreProducts";
import Testimonials from "@/components/Testimonials";
import NewsletterSection from "@/components/NewsletterSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <FeaturedCategories />
      <NewArrivals />
      <PromotionalBanners />
      <BestSellers />
      <ExploreProducts />
      <Testimonials />
      <NewsletterSection />
    </main>
  );
}

