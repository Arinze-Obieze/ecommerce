"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiArrowRight, FiShield, FiTruck, FiCheck } from 'react-icons/fi';
import CategoriesModal from './CategoriesModal';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic seller stats
  const [sellerCount, setSellerCount] = useState(0);

  const defaultBanner = {
    title: 'Discover Your Style',
    subtitle: 'Shop the latest fashion and essentials from trusted African stores',
    cta_text: 'Shop Now',
    cta_link: '/shop',
    background_image: null,
    foreground_image: null,
  };

  const categories = [
    { name: 'Categories', href: '#' },
    { name: 'New Arrivals', href: '/shop?sortBy=newest' },
    { name: 'Deals', href: '/shop?onSale=true' },
    { name: 'Top Stores', href: '/stores' },
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/hero-banner');
        const data = await res.json();
        if (data.banner && Array.isArray(data.banner) && data.banner.length > 0) {
          setBanners(data.banner);
        } else {
          setBanners([defaultBanner]);
        }
        if (data.sellerStats) {
          setSellerCount(data.sellerStats.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([defaultBanner]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const rawActiveBanner = banners[currentSlide] || defaultBanner;
  const activeBanner = {
    ...rawActiveBanner,
    background_image: rawActiveBanner.background_image || rawActiveBanner.backgroundImage,
    foreground_image: rawActiveBanner.foreground_image || rawActiveBanner.foregroundImage,
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formatCount = (num) => {
    if (num >= 10000) return Math.floor(num / 1000) + 'K+';
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K+';
    if (num > 0) return num.toLocaleString() + '+';
    return '';
  };

  const goToSlide = useCallback((idx) => {
    setCurrentSlide(idx);
  }, []);

  const hasBgImage = !!activeBanner.background_image;

  return (
    <div className="w-full bg-[#F9FAFB]">
      {/* ── Animations ── */}
      <style jsx global>{`
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroImageIn {
          from { opacity: 0; transform: translateX(32px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero-slide-in {
          animation: heroSlideIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-image-in {
          animation: heroImageIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
          opacity: 0;
        }
        .hero-float { animation: heroFloat 5s ease-in-out infinite; }
        .hero-fade-in {
          animation: heroFadeIn 0.4s ease 0.7s forwards;
          opacity: 0;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Secondary Navigation ── */}
      <div className="border-b border-gray-200/80 bg-white/70 backdrop-blur-md relative z-40">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto py-3 no-scrollbar">
            {categories.map((item) => {
              const isActive = activeTab === item.name;
              const classes = `relative text-[13px] font-semibold tracking-wide uppercase whitespace-nowrap transition-all duration-300 pb-1.5 ${
                isActive ? 'text-[#0A3D2E]' : 'text-gray-500 hover:text-[#0A3D2E]'
              }`;
              const underline = (
                <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00B86B] transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
              );

              if (item.name === 'Categories') {
                return (
                  <button key={item.name} onClick={() => { setActiveTab(item.name); openModal(); }} className={classes}>
                    {item.name}
                    {underline}
                  </button>
                );
              }
              return (
                <Link key={item.name} href={item.href} onClick={() => { setActiveTab(item.name); closeModal(); }} className={classes}>
                  {item.name}
                  {underline}
                </Link>
              );
            })}
          </div>
        </div>
        {isModalOpen && <CategoriesModal onClose={closeModal} />}
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden min-h-[500px] md:min-h-[560px]">
        {/* Background layers */}
        {banners.map((banner, index) => {
          const bgImage = banner.background_image || banner.backgroundImage;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.03]'
              }`}
            >
              {bgImage ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#EDFAF3] via-[#F9FAFB] to-[#E8F5EE]" />
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.035] pointer-events-none">
                    <div className="absolute top-[10%] right-[10%] w-72 h-72 rounded-full border-[2px] border-[#0A3D2E]" />
                    <div className="absolute top-[30%] right-[5%] w-44 h-44 rounded-full border-[2px] border-[#00B86B]" />
                    <div className="absolute bottom-[15%] right-[22%] w-36 h-36 rounded-full border-[2px] border-[#0A3D2E]" />
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Content */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex flex-col md:flex-row items-center justify-between py-14 md:py-20 gap-8 md:gap-12">

            {/* ── Left: Text ── */}
            <div
              key={`content-${currentSlide}`}
              className={`${activeBanner.foreground_image ? 'flex-1 max-w-xl' : 'flex-1 max-w-2xl'} text-center md:text-left ${isLoading ? 'opacity-0' : 'hero-slide-in'}`}
            >
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6 ${
                  hasBgImage
                    ? 'bg-white/15 backdrop-blur-sm text-white/90 border border-white/20'
                    : 'bg-[#0A3D2E]/[0.04] text-[#0A3D2E] border border-[#0A3D2E]/10'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B86B]" style={{ animation: 'pulseDot 2s ease infinite' }} />
                New on Zova
              </div>

              <h1
                className={`text-[2.25rem] sm:text-[2.75rem] md:text-5xl lg:text-[3.25rem] font-extrabold mb-5 leading-[1.08] tracking-[-0.02em] ${
                  hasBgImage ? 'text-white' : 'text-[#0A3D2E]'
                }`}
              >
                {activeBanner.title}
              </h1>

              <p
                className={`text-[15px] md:text-base mb-8 max-w-md mx-auto md:mx-0 leading-relaxed ${
                  hasBgImage ? 'text-gray-200' : 'text-gray-500'
                }`}
              >
                {activeBanner.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <Link
                  href={activeBanner.cta_link || '/shop'}
                  className="group relative px-8 py-3.5 bg-[#00B86B] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(0,184,107,0.3)] hover:shadow-[0_8px_28px_rgba(0,184,107,0.35)] hover:bg-[#0F7A4F] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2.5 text-[15px]"
                >
                  {activeBanner.cta_text}
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/shop?onSale=true"
                  className={`px-8 py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 text-[15px] ${
                    hasBgImage
                      ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                      : 'bg-white text-[#0A3D2E] border border-gray-200 hover:border-[#00B86B]/30 hover:shadow-md'
                  }`}
                >
                  View Deals
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust line — dynamic count, no stars */}
              <div className={`flex items-center justify-center md:justify-start gap-3 sm:gap-4 text-[13px] ${hasBgImage ? 'text-gray-300' : 'text-gray-500'}`}>
                <div className="flex items-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-[#00B86B]" />
                  <span className="font-medium">
                    {sellerCount > 0 ? `${formatCount(sellerCount)} Verified Stores` : 'Verified Stores'}
                  </span>
                </div>
                <span className={`w-[3px] h-[3px] rounded-full ${hasBgImage ? 'bg-gray-400' : 'bg-gray-300'}`} />
                <div className="flex items-center gap-1.5">
                  <FiTruck className="w-3.5 h-3.5" />
                  <span>Fast Delivery</span>
                </div>
                <span className={`w-[3px] h-[3px] rounded-full hidden sm:block ${hasBgImage ? 'bg-gray-400' : 'bg-gray-300'}`} />
                <div className="hidden sm:flex items-center gap-1.5">
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>

            {/* ── Right: Visual (only when foreground image exists) ── */}
            {activeBanner.foreground_image && (
              <div
                key={`image-${currentSlide}`}
                className={`flex-1 relative flex justify-center md:justify-end ${isLoading ? 'opacity-0' : 'hero-image-in'}`}
              >
                <div className="relative w-72 h-80 md:w-[340px] md:h-[400px]">
                  <img
                    src={activeBanner.foreground_image}
                    alt="Featured"
                    className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] hero-float"
                  />
                  <div className="absolute inset-0 -z-10 blur-3xl opacity-15 bg-[#00B86B] rounded-full scale-75" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="group p-1"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div className={`h-[5px] rounded-full transition-all duration-500 ${
                  idx === currentSlide
                    ? 'w-8 bg-[#00B86B]'
                    : 'w-3 bg-gray-400/30 group-hover:bg-[#00B86B]/40'
                }`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Trust Marquee Bar ── */}
      <div className="border-t border-b border-gray-200/60 bg-white/50 backdrop-blur-sm hero-fade-in overflow-hidden">
        <div className="py-2.5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none" />
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 35s linear infinite' }}>
            {[0, 1].map((repeat) => (
              <div key={repeat} className="flex items-center shrink-0">
                {[
                  { icon: '🛡️', text: 'Buyer Protection on Every Order' },
                  { icon: '🚚', text: 'Fast & Reliable Delivery' },
                  { icon: '✓', text: `${sellerCount > 0 ? formatCount(sellerCount) + ' ' : ''}Verified African Stores` },
                  { icon: '💳', text: 'Secure Payment Methods' },
                  { icon: '🔄', text: 'Easy Returns & Refunds' },
                  { icon: '📦', text: 'Track Your Orders Live' },
                ].map((item, i) => (
                  <span key={`${repeat}-${i}`} className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 tracking-wider uppercase mx-6">
                    <span className="text-sm">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;