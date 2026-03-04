"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiStar, FiChevronRight } from 'react-icons/fi';
import CategoriesModal from './CategoriesModal';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Default banner fallback
  const defaultBanner = {
    title: 'Discover Your Style',
    subtitle: 'Shop the latest fashion, and essentials from trusted African stores',
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

  /* Fetch Banner Data */
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
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([defaultBanner]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

  /* Auto-play Slideshow */
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Safe access to current banner data
  const rawActiveBanner = banners[currentSlide] || defaultBanner;
  const activeBanner = {
      ...rawActiveBanner,
      background_image: rawActiveBanner.background_image || rawActiveBanner.backgroundImage,
      foreground_image: rawActiveBanner.foreground_image || rawActiveBanner.foregroundImage,
  };

  return (
    <div className="w-full bg-[#f8f5f2]">
      {/* Secondary Navigation Strip */}
      <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm relative z-40">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center gap-8 md:gap-12 overflow-x-auto py-3 no-scrollbar">
            {categories.map((item) => {
              if (item.name === 'Categories') {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsModalOpen(!isModalOpen);
                    }}
                    className={`text-sm font-medium whitespace-nowrap transition-all pb-1 ${
                      activeTab === item.name
                        ? 'text-[#2E5C45] border-b-2 border-[#2E5C45]'
                        : 'text-gray-600 hover:text-[#2E5C45] border-b-2 border-transparent'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.name)}
                  className={`text-sm font-medium whitespace-nowrap transition-all pb-1 ${
                    activeTab === item.name
                      ? 'text-[#2E5C45] border-b-2 border-[#2E5C45]'
                      : 'text-gray-600 hover:text-[#2E5C45] border-b-2 border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Modal outside max-w container to span full width */}
        {isModalOpen && activeTab === 'Categories' && (
           <CategoriesModal />
        )}
      </div>

      {/* Hero Banner Area */}
      <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        
        {/* Background Transition Group could go here, but for simplicity we'll just render the active one absolutely or change BG */}
        {banners.map((banner, index) => {
            // Handle both snake_case (DB) and camelCase (potential serialization)
            const bgImage = banner.background_image || banner.backgroundImage;
            const fgImage = banner.foreground_image || banner.foregroundImage;
            
            // Unique gradients for fallback
            const gradients = [
                'linear-gradient(to right, #e8e6e1, #d8d6d1)', // Beige (Default)
                'linear-gradient(to right, #ebf4f5, #b5c6e0)', // Blue-ish
                'linear-gradient(to right, #f5ebe0, #e0b5b5)', // Red-ish
                'linear-gradient(to right, #e0f5eb, #b5e0c4)', // Green-ish
            ];
            const fallbackGradient = gradients[index % gradients.length];

            return (
                <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    {/* Background Image/Gradient Configuration */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear transform scale-105"
                        style={{ 
                            backgroundImage: bgImage ? `url(${bgImage})` : fallbackGradient,
                        }}
                    >
                        {/* Ensure we have a base color if image takes time to load */}
                        {!bgImage && <div className="absolute inset-0" style={{ background: fallbackGradient }} />}
                    </div>
                    
                    {/* Overlay - Darken if image exists */}
                    {bgImage && (
                        <div className="absolute inset-0 bg-black/40"></div>
                    )}
                    
                     {/* Default Texture if no image */}
                     {!bgImage && (
                         <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                         </div>
                     )}
                </div>
            );
        })}

        {/* Content Container (Z-index high to sit above backgrounds) */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20 gap-10">
            
            {/* Left Content */}
            <div className={`flex-1 max-w-2xl text-center md:text-left transition-all duration-500 transform ${isLoading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ${activeBanner.background_image ? 'text-white drop-shadow-md' : 'text-[#1a382b]'}`}>
                {activeBanner.title}
              </h1>
              <p className={`text-lg mb-8 max-w-lg mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-1 ${activeBanner.background_image ? 'text-gray-100 drop-shadow-sm' : 'text-gray-700'}`}>
                {activeBanner.subtitle}
                <FiChevronRight className="w-5 h-5" />
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link href={activeBanner.cta_link || '/shop'} className="px-8 py-3 bg-[#2E5C45] text-white font-semibold rounded-lg shadow-lg hover:bg-[#254a38] transition-all transform hover:-translate-y-0.5">
                  {activeBanner.cta_text}
                </Link>
                <Link href="/shop?onSale=true" className={`px-8 py-3 bg-transparent border font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                    activeBanner.background_image 
                    ? 'border-white text-white hover:bg-white/10' 
                    : 'border-gray-400 text-[#2E5C45] hover:bg-[#2E5C45]/5'
                }`}>
                  Top Deals <FiChevronRight />
                </Link>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className={`text-sm font-medium ${activeBanner.background_image ? 'text-gray-200' : 'text-gray-600'}`}>
                  Over 10,000+ Trusted Stores
                </span>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="flex-1 relative flex justify-center md:justify-end">
               {activeBanner.foreground_image ? (
                  <div className="relative w-64 h-80 md:w-80 md:h-96">
                      <img 
                        src={activeBanner.foreground_image} 
                        alt="Featured Product" 
                        className="w-full h-full object-contain drop-shadow-2xl animate-float"
                      />
                  </div>
               ) : (
                  /* Default Graphic if no foreground image provided */
                  <div className="relative w-64 h-80 md:w-80 md:h-96 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-[#3b7a5e] to-[#2E5C45] rounded-lg shadow-2xl relative flex items-center justify-center overflow-hidden border-t-8 border-[#254a38]">
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-8 border-[#d4a373] rounded-full z-0 clip-path-half"></div>
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-8 border-b-0 border-[#d4a373] rounded-t-full rounded-b-none z-10"></div>
                        <div className="absolute bottom-10 right-8 transform rotate-12">
                            <FiStar className="w-24 h-24 text-[#f0e6d2] opacity-80 fill-current" />
                        </div>
                        <div className="absolute inset-0 bg-black opacity-5 mix-blend-overlay"></div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/20 blur-xl rounded-full"></div>
                  </div>
               )}
            </div>

          </div>
        </div>

        {/* Slide Indicators / Navigation */}
        {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            idx === currentSlide 
                            ? 'bg-[#2E5C45] w-8' 
                            : 'bg-gray-400/50 hover:bg-[#2E5C45]/70'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
