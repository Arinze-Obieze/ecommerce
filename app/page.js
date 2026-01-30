"use client";

import Hero from "@/components/Hero";
import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivals from "@/components/NewArrivals";
import PromotionalBanners from "@/components/PromotionalBanners";




export default function Home() {
 
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <NewArrivals />
      <PromotionalBanners />
    </>
  );
}

