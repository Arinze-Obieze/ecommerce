import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SectionCarousel = ({ children, title, linkText, linkHref }) => {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const progress = scrollLeft / (scrollWidth - clientWidth);
        setScrollProgress(Math.min(1, Math.max(0, progress)));
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = direction === 'left' ? -300 : 300;
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white border-b border-gray-50">
      <div className="max-w-[1600px] mx-auto relative px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
           <h2 className="text-xl md:text-3xl font-bold text-gray-900">{title}</h2>
           {linkText && linkHref && (
             <a href={linkHref} className="text-[#2E5C45] font-medium hover:underline text-sm md:text-base">
               {linkText}
             </a>
           )}
        </div>

        {/* Scroll Buttons (Desktop) */}
        <div className="hidden md:block absolute top-[60%] -translate-y-1/2 left-2 z-10">
            <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#2E5C45] hover:text-white transition-all disabled:opacity-50"
            >
                <FiChevronLeft className="w-5 h-5" />
            </button>
        </div>
        <div className="hidden md:block absolute top-[60%] -translate-y-1/2 right-2 z-10">
            <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#2E5C45] hover:text-white transition-all"
            >
                <FiChevronRight className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Container */}
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 md:gap-6 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {React.Children.map(children, (child) => (
               // Explicit width to prevent expanding to huge sizes
               <div className="w-[45%] md:w-[260px] lg:w-[280px] snap-center flex-shrink-0">
                  {child}
               </div>
            ))}
        </div>

        {/* Progress Indicator (Mobile Only mostly helpful) */}
        <div className="flex md:hidden justify-center mt-2 gap-1.5 h-1">
            <div className="w-20 bg-gray-200 rounded-full h-1 overflow-hidden">
                <div 
                    className="h-full bg-[#2E5C45] transition-all duration-300"
                    style={{ width: `${(scrollProgress * 100) || 10}%` }}
                ></div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default SectionCarousel;
