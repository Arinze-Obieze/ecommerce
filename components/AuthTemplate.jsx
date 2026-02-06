"use client";
import React from 'react';
import AuthFooter from '@/components/AuthFooter';

export default function AuthTemplate({ title, subtitle, children }) {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-[url('/bg.jpeg')] md:bg-[url('/bg_big.jpeg')] md:bg-black/20"
    >
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 w-full max-w-2xl mx-auto">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <h1 className="text-xl font-bold text-gray-800">ShopHub</h1>
          </div>
          {title && <p className="text-lg text-gray-600 font-medium">{title}</p>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {/* Form Container */}
        <div className="w-full p-6 md:p-8">
          {children}
        </div>

        {/* Footer Section */}
        <AuthFooter />
      </main>
    </div>
  );
}
