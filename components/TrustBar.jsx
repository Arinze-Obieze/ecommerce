"use client";
import React from 'react';
import { FiCheckCircle, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';

const TrustBar = () => {
  const features = [
    {
      icon: <FiCheckCircle className="w-6 h-6 text-[#2E5C45]" />,
      title: "Verified Stores",
      description: "Trusted & Vetted"
    },
    {
      icon: <FiTruck className="w-6 h-6 text-[#2E5C45]" />,
      title: "Fast Delivery",
      description: "Nationwide Shipping"
    },
    {
      icon: <FiShield className="w-6 h-6 text-[#2E5C45]" />,
      title: "Secure Payment",
      description: "100% Protected"
    },
    {
      icon: <FiHeadphones className="w-6 h-6 text-[#2E5C45]" />,
      title: "24/7 Support",
      description: "Dedicated Care"
    }
  ];

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
              <div className="flex-shrink-0 w-12 h-12 bg-[#2E5C45]/10 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
