import Hero from '@/components/storefront/home/Hero';
import TrendingProductsGrid from '@/components/storefront/home/TrendingProductsGrid';
import TopStoresCarousel from '@/components/storefront/home/TopStoresCarousel';
import ExploreProducts from '@/components/storefront/home/ExploreProducts';

export function CarouselSectionFallback({ title }) {
  return (
    <section className="py-8 md:py-12 bg-white border-b border-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="h-8 w-48 rounded bg-gray-100 animate-pulse" />
          <div className="hidden md:block h-5 w-24 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="flex gap-3 md:gap-6 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="w-[45%] md:w-[260px] lg:w-[280px] shrink-0">
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-3/4bg-gray-100 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-8 bg-gray-100 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopStoresFallback() {
  return (
    <section className="py-8 md:py-12 bg-white border-b border-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
          <div className="hidden md:block h-5 w-28 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="flex gap-3 md:gap-6 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="w-[45%] md:w-[260px] lg:w-[280px] shrink-0">
              <div className="rounded-2xl p-5 border border-gray-100 bg-white animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded bg-gray-100 w-3/4" />
                    <div className="h-3 rounded bg-gray-100 w-full" />
                    <div className="h-3 rounded bg-gray-100 w-2/3" />
                  </div>
                </div>
                <div className="h-px mb-4 bg-gray-100" />
                <div className="flex gap-2">
                  <div className="h-7 rounded-full bg-gray-100 flex-1" />
                  <div className="h-7 rounded-full bg-gray-100 flex-1" />
                  <div className="h-7 rounded-full bg-gray-100 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExploreFallback() {
  return (
    <section className="bg-(--zova-linen) py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-9 text-center">
          <div className="mx-auto mb-3 h-4 w-32 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto mb-3 h-8 w-64 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-3/4w-full bg-(--zova-surface-alt)" />
              <div className="px-3 py-[10px] pb-3">
                <div className="mb-1.5 h-2 w-3/5 rounded bg-(--zova-surface-alt)" />
                <div className="mb-2 h-[11px] w-[85%] rounded bg-(--zova-surface-alt)" />
                <div className="mb-2.5 h-[11px] w-[45%] rounded bg-(--zova-surface-alt)" />
                <div className="h-[30px] w-full rounded-lg bg-(--zova-surface-alt)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeroFallback() {
  return (
    <div className="w-full zova-page-surface">
      <div className="relative z-40">
        <div className="zova-shell zova-topbar mt-3 rounded-full px-3 sm:px-5">
          <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto py-3 no-scrollbar">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full pt-5 pb-3">
        <div className="zova-shell flex items-center justify-between mb-3">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-gray-100 animate-pulse" />
            <div className="h-8 w-44 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="lg:hidden">
          <div className="relative rounded-2xl overflow-hidden h-[320px] sm:h-[380px] bg-gradient-to-br from-primary-hover via-primary to-primary animate-pulse" />
          <div className="flex gap-2.5 mt-2.5 overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="min-w-[100px] w-[100px] h-[125px] rounded-[13px] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="hidden gap-2 lg:grid lg:h-[500px] lg:grid-cols-[1fr_1.9fr_1fr]">
          <div className="rounded-[18px] bg-gray-100 animate-pulse" />
          <div className="rounded-2xl bg-linear-to-br from-primary-hover via-primary to-primary animate-pulse" />
          <div className="flex flex-col gap-2.5 h-full">
            <div className="flex-1 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="flex-1 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="border-t border-b border-primary/10 bg-white/60 backdrop-blur-sm overflow-hidden mt-2">
        <div className="py-2.5 px-4">
          <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export async function HeroSection({ promise }) {
  const data = await promise;
  const banner = Array.isArray(data?.banner) && data.banner.length > 0
    ? {
        ...data.banner[0],
        background_image: data.banner[0].background_image || data.banner[0].backgroundImage,
      }
    : null;

  return (
    <Hero
      initialBanner={banner}
      initialSellerCount={data?.sellerStats?.count ?? 0}
    />
  );
}

export async function TrendingProductsSection({ bestSellersPromise, newArrivalsPromise, recommendedPromise }) {
  const [bestSellers, newArrivals, recommended] = await Promise.all([
    bestSellersPromise,
    newArrivalsPromise,
    recommendedPromise,
  ]);

  return (
    <TrendingProductsGrid 
      bestSellers={Array.isArray(bestSellers?.data) ? bestSellers.data : []}
      newArrivals={Array.isArray(newArrivals?.data) ? newArrivals.data : []}
      recommended={Array.isArray(recommended?.data) ? recommended.data : []}
    />
  );
}

export async function TopStoresSection({ promise }) {
  const data = await promise;
  return <TopStoresCarousel initialStores={Array.isArray(data?.data) ? data.data : []} />;
}

export async function ExploreSection({ promise }) {
  const data = await promise;
  return <ExploreProducts initialProducts={Array.isArray(data?.data) ? data.data : []} />;
}
