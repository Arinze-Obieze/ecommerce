'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { getHeroBanner } from '@/features/storefront/home/api/client';
import { CHIP_MOODS, HERO_MOOD, SIDE_MOODS } from './hero.constants';
import { normalizeBanner } from './hero.utils';
import MoodCard from './MoodCard';
import HeroNav from './HeroNav';
import HeroBanner from './HeroBanner';
import TrustMarquee from './TrustMarquee';

const CategoriesModal = dynamic(() => import('@/components/catalog/browse/CategoriesModal'), { ssr: false });

export default function Hero({ initialBanner = null, initialSellerCount = null }) {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banner, setBanner] = useState(normalizeBanner(initialBanner));
  const [sellerCount, setSellerCount] = useState(typeof initialSellerCount === 'number' ? initialSellerCount : 0);
  const [expanded, setExpanded] = useState(false);

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
    <div className="w-full zova-page">
      <HeroNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'Categories') setIsModalOpen(false);
        }}
        onOpenCategories={() => setIsModalOpen(true)}
      />

      {isModalOpen ? <CategoriesModal onClose={() => setIsModalOpen(false)} /> : null}

      <div className="w-full pb-3 pt-5">
        <div className="zova-shell mb-3 flex items-center justify-between">
          <div>
            <span className="zova-eyebrow">Curated discovery</span>
            <h2 className="zova-title mt-3 text-[1.35rem] font-black">Shop by mood</h2>
          </div>
          <Link href="/mood" className="flex items-center gap-1 text-[12px] font-semibold text-(--zova-primary-action) transition-colors hover:text-(--zova-accent-emphasis)">
            See all moods <FiArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="hidden gap-2 lg:grid lg:h-[500px] lg:grid-cols-[1fr_1.9fr_1fr]">
          <MoodCard mood={HERO_MOOD} variant="hero" />
          <HeroBanner banner={banner} sellerCount={sellerCount} />
          <div className="flex h-full flex-col gap-2.5">
            {SIDE_MOODS.map((mood) => (
              <MoodCard key={mood.link} mood={mood} variant="side" />
            ))}
          </div>
        </div>

        <div className="lg:hidden">
          <HeroBanner banner={banner} sellerCount={sellerCount} />

          <div className="zova-hero-rail zova-scrollbar-hide mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
            {[HERO_MOOD, ...SIDE_MOODS, ...CHIP_MOODS].map((mood) => (
              <MoodCard key={mood.link} mood={mood} variant="rail" />
            ))}
          </div>
        </div>

        <div
          className={`zova-hero-rail zova-scrollbar-hide zova-shell mt-2 hidden gap-2.5 overflow-x-auto pb-1 transition-[max-height] duration-400 ease-in-out lg:flex ${
            expanded ? 'max-h-[180px] overflow-auto' : 'max-h-0 overflow-hidden'
          }`}
        >
          {CHIP_MOODS.map((mood) => (
            <MoodCard key={mood.link} mood={mood} variant="chip" />
          ))}
        </div>

        <div className="zova-shell mt-2 hidden px-4 lg:block">
          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#d0d0d0] bg-transparent px-4 py-2.5 text-[13px] font-medium text-[#666] transition-colors hover:border-(--zova-primary-action) hover:text-(--zova-primary-action)"
          >
            <span
              className={`inline-block text-[11px] transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}
            >
              ▼
            </span>
            {expanded ? 'Show less' : `Show all moods (${CHIP_MOODS.length} more)`}
          </button>
        </div>
      </div>

      <TrustMarquee />
    </div>
  );
}
