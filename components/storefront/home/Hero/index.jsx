'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { getHeroBanner } from '@/features/storefront/home/api/client';
import { normalizeBanner } from './hero.utils';
import HeroNav from './HeroNav';
import HeroBanner from './HeroBanner';
import TrustMarquee from './TrustMarquee';

const CategoriesModal = dynamic(() => import('@/components/catalog/browse/CategoriesModal'), { ssr: false });

export default function Hero({ initialBanner = null, initialSellerCount = null }) {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banner, setBanner] = useState(normalizeBanner(initialBanner));
  const [sellerCount, setSellerCount] = useState(typeof initialSellerCount === 'number' ? initialSellerCount : 0);

  useEffect(() => {
    const hasInitialBanner = Boolean(initialBanner);
    const hasInitialSellerCount = typeof initialSellerCount === 'number';
    if (hasInitialBanner && hasInitialSellerCount) return undefined;

    let active = true;

    (async () => {
      try {
        const data = await getHeroBanner();
        if (!active) return;

        if (!hasInitialBanner && data.banner?.length > 0) {
          setBanner(normalizeBanner(data.banner[0]));
        }

        if (!hasInitialSellerCount && data.sellerStats) {
          setSellerCount(data.sellerStats.count || 0);
        }
      } catch {}
    })();

    return () => {
      active = false;
    };
  }, [initialBanner, initialSellerCount]);

  return (
    <div className="w-full zova-page-surface">
      <HeroNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'Categories') setIsModalOpen(false);
        }}
        onOpenCategories={() => setIsModalOpen(true)}
      />

      {isModalOpen ? <CategoriesModal onClose={() => setIsModalOpen(false)} /> : null}

      <div className="w-full pt-5">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="relative h-[320px] w-full overflow-hidden rounded-[12px] sm:h-[400px] lg:h-[500px]">
            <HeroBanner banner={banner} sellerCount={sellerCount} />
          </div>
        </div>
      </div>

      <TrustMarquee />
    </div>
  );
}
