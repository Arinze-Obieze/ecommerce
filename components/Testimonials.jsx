"use client";
import React from 'react';
import { FiStar } from 'react-icons/fi';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah A.",
      role: "Fashion Enthusiast",
      content: "The quality of clothes I bought here is amazing! Fast delivery and exactly as described.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Michael O.",
      role: "Frequent Shopper",
      content: "Finally a platform where I can trust the sellers. The verification process really makes a difference.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Chidinma K.",
      role: "Style Influencer",
      content: "I love the variety of categories. Found some unique pieces that I couldn't find anywhere else.",
      rating: 4,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-16 bg-[#f8f5f2]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied shoppers who have found their perfect style with us.
          </p>
        </div>

        {/* Desktop Grid / Mobile Scroll */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 md:gap-8 pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative min-w-[85%] md:min-w-0 snap-center">
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-8 text-6xl text-[#2E5C45]/10 font-serif leading-none">
                &rdquo;
              </div>

              <div className="flex items-center gap-1 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>

              <p className="text-gray-700 mb-6 relative z-10 leading-relaxed text-sm md:text-base">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
