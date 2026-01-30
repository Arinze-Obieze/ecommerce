import { useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiStar, FiChevronRight } from 'react-icons/fi';
import CategoriesModal from './CategoriesModal';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = [
    { name: 'Categories', href: '#' },
    { name: 'New Arrivals', href: '#' },
    { name: 'Deals', href: '#' },
    { name: 'Top Sellers', href: '#' },
  ];

  return (
    <div className="w-full bg-[#f8f5f2]">
      {/* Secondary Navigation Strip */}
      <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm relative z-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-center gap-8 md:gap-12 overflow-x-auto py-3 no-scrollbar">
            {categories.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (item.name === 'Categories') {
                    setIsModalOpen(!isModalOpen);
                  } else {
                    setIsModalOpen(false);
                  }
                }}
                className={`text-sm font-medium whitespace-nowrap transition-all pb-1 ${
                  activeTab === item.name
                    ? 'text-[#2E5C45] border-b-2 border-[#2E5C45]'
                    : 'text-gray-600 hover:text-[#2E5C45] border-b-2 border-transparent'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
            
          {/* Modal - positioned relative to the max-width container to align, OR we want full width? 
              CategoriesModal expects to be full width of its parent. 
              If we want it full viewport width, it should be outside this max-w container?
              Wait, CategoriesModal has internal max-w wrapper.
              So if we put it here (inside max-w), its width will be limited to 1600px.
              If we want the background to stretch, it must be outside max-w container.
          */}
        </div>
        
        {/* Modal outside max-w container to span full width */}
        {isModalOpen && activeTab === 'Categories' && (
           <CategoriesModal />
        )}
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#e8e6e1] to-[#d8d6d1]">
        {/* Abstract Background Elements (Simulating the city/texture) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20 gap-10">
            
            {/* Left Content */}
            <div className="flex-1 max-w-2xl z-10 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a382b] mb-4 leading-tight">
                Discover Your Style
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-1">
                Shop the latest fashion, and essentials from trusted African sellers 
                <FiChevronRight className="w-5 h-5" />
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <button className="px-8 py-3 bg-[#2E5C45] text-white font-semibold rounded-lg shadow-lg hover:bg-[#254a38] transition-all transform hover:-translate-y-0.5">
                  Shop Now
                </button>
                <button className="px-8 py-3 bg-transparent border border-gray-400 text-[#2E5C45] font-semibold rounded-lg hover:bg-[#2E5C45]/5 transition-colors flex items-center gap-2">
                  Top Deals <FiChevronRight />
                </button>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Over 10,000+ Trusted Sellers
                </span>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="flex-1 relative flex justify-center md:justify-end">
              <div className="relative w-64 h-80 md:w-80 md:h-96 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Shopping Bag Illustration */}
                <div className="w-full h-full bg-gradient-to-br from-[#3b7a5e] to-[#2E5C45] rounded-lg shadow-2xl relative flex items-center justify-center overflow-hidden border-t-8 border-[#254a38]">
                    {/* Handle */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-8 border-[#d4a373] rounded-full z-0 clip-path-half"></div>
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-8 border-b-0 border-[#d4a373] rounded-t-full rounded-b-none z-10"></div>
                    
                    {/* Star Icon */}
                    <div className="absolute bottom-10 right-8 transform rotate-12">
                         <FiStar className="w-24 h-24 text-[#f0e6d2] opacity-80 fill-current" />
                    </div>
                    
                    {/* Texture/Noise */}
                    <div className="absolute inset-0 bg-black opacity-5 mix-blend-overlay"></div>
                </div>
                
                {/* Shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/20 blur-xl rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
