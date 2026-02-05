"use client";
import React from 'react';
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6 col-span-2 md:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight">ShopHub</h2>
            <p className="text-gray-400 leading-relaxed">
              Your premium destination for fashion, style, and quality. We connect you with trusted sellers across the nation.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#2E5C45] transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#2E5C45] transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#2E5C45] transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#2E5C45] transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="/shop?sortBy=newest" className="text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?sortBy=rating" className="text-gray-400 hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop?hasDiscount=true" className="text-gray-400 hover:text-white transition-colors">Deals & Discounts</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">All Categories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/orders" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-gray-400">
                <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>123 Fashion Street, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-4 text-gray-400 mt-4">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-4 text-gray-400 mt-4">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <span>support@shophub.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
