import Link from 'next/link';
import { FiArrowRight, FiChevronRight, FiCheck, FiShield, FiTruck } from 'react-icons/fi';
import { formatSellerCount } from './hero.utils';
import HeroSlideIndicators from './HeroSlideIndicators';
import { HERO_SLIDES } from './hero.constants';
import useHeroSlides from './useHeroSlides';

const HERO_BANNER_ACTIONS = [
  {
    key: 'primary',
    href: (banner) => banner?.cta_link || '/shop',
    label: (banner) => banner?.cta_text || 'Shop Now',
    mobileLabel: (banner) => banner?.cta_text || 'Shop Now',
    icon: FiArrowRight,
    className: 'zova-btn zova-btn-primary px-6 py-2.5 text-sm lg:px-[1.25rem] lg:py-[0.9rem] lg:text-[13px]',
  },
  {
    key: 'deals',
    href: () => '/shop?onSale=true',
    label: () => 'View Deals',
    mobileLabel: () => 'Deals',
    icon: FiChevronRight,
    className: 'zova-btn rounded-full border border-white/20 bg-white/12 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/22 lg:px-7 lg:py-3 lg:text-[13px]',
  },
];

const HERO_TRUST_ITEMS = [
  {
    key: 'stores',
    icon: FiShield,
    iconClassName: 'text-(--zova-accent-emphasis)',
    label: (sellerCount) => sellerCount > 0 ? `${formatSellerCount(sellerCount)} Verified Stores` : 'Verified Stores',
  },
  {
    key: 'delivery',
    icon: FiTruck,
    iconClassName: '',
    label: () => 'Secure Delivery',
  },
  {
    key: 'protection',
    icon: FiCheck,
    iconClassName: '',
    label: () => 'Buyer Protection',
  },
];

function BannerEyebrow({ mobile = false }) {
  return (
    <div className={`inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm ${mobile ? 'mb-3' : 'mb-4'}`}>
      <span className="zova-hero-pulse-dot h-1.5 w-1.5 rounded-full bg-(--zova-accent-emphasis)" />
      New on Zova
    </div>
  );
}

export default function HeroBanner({ banner, sellerCount }) {
  const { activeSlide, setActiveSlide } = useHeroSlides();

  return (
    <div className="relative h-80 overflow-hidden rounded-2xl sm:h-[380px] lg:h-full">
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent lg:from-black/72 lg:via-black/22 lg:to-black/5" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8 xl:p-10">
        <BannerEyebrow mobile />
 
        <div className="mb-0 flex items-center gap-2.5 lg:mb-6 lg:gap-3">
          {HERO_BANNER_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.key} href={action.href(banner)} className={action.className}>
                <span className="lg:hidden">{action.mobileLabel(banner)}</span>
                <span className="hidden lg:inline">{action.label(banner)}</span>
                <Icon className="h-3.5 w-3.5" />
              </Link>
            );
          })}
        </div>
        <div className="mt-4 hidden items-center gap-3 text-[11px] text-white/55 lg:flex">
          {HERO_TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="contents">
                {index > 0 ? <span className="h-1 w-1 rounded-full bg-white/25" /> : null}
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3 w-3 ${item.iconClassName}`} />
                  <span>{item.label(sellerCount)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <HeroSlideIndicators activeSlide={activeSlide} onSelectSlide={setActiveSlide} />
      </div>
    </div>
  );
}
