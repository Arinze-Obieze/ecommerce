// Footer.jsx
'use client';

import React, { useState } from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaPinterest,
  FaSnapchat,
  FaTiktok,
  FaApple,
  FaAndroid,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaCcDiscover,
  FaArrowRight,
  FaCheckCircle,
  FaPhone,
  FaWhatsapp
} from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/register', '/forgot-password', '/reset-password'].some(
    (path) => pathname?.startsWith(path)
  );

  if (pathname?.startsWith('/admin') || isAuthPage) {
    return null;
  }

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
      setEmail('');
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone) {
      setPhoneSuccess(true);
      setTimeout(() => setPhoneSuccess(false), 3000);
      setPhone('');
    }
  };

  const handleWhatsappSubmit = (e) => {
    e.preventDefault();
    if (whatsapp) {
      setWhatsappSuccess(true);
      setTimeout(() => setWhatsappSuccess(false), 3000);
      setWhatsapp('');
    }
  };

  const navSections = [
    {
      title: 'Company Info',
      links: [
        'About Us',
        'Fashion Blogger',
        'Social Responsibility',
        'Canadian Supply',
        'Chains Act Report',
        'Supplier Code of Conduct',
        'Careers',
        'Student Discount'
      ]
    },
    {
      title: 'Help & Support',
      links: [
        'Shipping Info',
        'Free Returns',
        'How To Order',
        'How To Track',
        'Size Guide',
        'VIP',
        'Refund',
        'Affiliate'
      ]
    },
    {
      title: 'Customer Care',
      links: [
        'Contact Us',
        'Payment Method',
        'Bonus Point',
        'Recalls',
        'FAQ'
      ]
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, name: 'Facebook' },
    { icon: FaInstagram, name: 'Instagram' },
    { icon: FaTwitter, name: 'Twitter' },
    { icon: FaYoutube, name: 'YouTube' },
    { icon: FaPinterest, name: 'Pinterest' },
    { icon: FaSnapchat, name: 'Snapchat' },
    { icon: FaTiktok, name: 'TikTok' }
  ];

  const paymentMethods = [
    { icon: 'VISA', color: 'bg-blue-600' },
    { icon: 'MC', color: 'bg-orange-600' },
    { component: FaCcMastercard, color: 'bg-blue-500' },
    { component: FaCcAmex, color: 'bg-gray-100', border: true },
    { component: FaCcDiscover, color: 'bg-blue-400' },
    { component: FaCcPaypal, color: 'bg-gray-100', border: true },
    { text: 'G Pay', color: 'bg-green-500' },
    { text: 'Klarna', color: 'bg-gray-100', border: true, textColor: 'text-pink-600' },
    { text: 'Apple', color: 'bg-gray-100', border: true },
    { text: 'G Pay', color: 'bg-gray-100', border: true }
  ];

  const bottomLinks = [
    'Privacy Center',
    'Privacy & Cookie Policy',
    'Manage Cookies',
    'Terms & Conditions',
    'Marketplace IP Rules',
    'IP Notice',
    'Imprint',
    'Ad Choice',
    '🍁 Canada'
  ];

  return (
    <footer className="bg-white border-t border-gray-200 relative">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-sm mb-2">📧 Email Updates</h3>
              <p className="text-xs text-gray-600 mb-3">Get exclusive offers and style news</p>
              <form onSubmit={handleEmailSubmit} className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 focus:outline-none focus:border-black"
                  aria-label="Email for newsletter"
                  required
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition flex items-center gap-1"
                  aria-label="Subscribe to email newsletter"
                >
                  <FaArrowRight />
                </button>
              </form>
              {emailSuccess && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <FaCheckCircle /> Thanks for subscribing!
                </p>
              )}
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-bold text-sm mb-2">📱 SMS Updates</h3>
              <p className="text-xs text-gray-600 mb-3">Get deals via text message</p>
              <form onSubmit={handlePhoneSubmit} className="flex">
                <select
                  className="w-24 px-2 py-2.5 text-sm border border-gray-300 bg-white focus:outline-none focus:border-black"
                  aria-label="Country code"
                >
                  <option>CA +1</option>
                  <option>US +1</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm border border-l-0 border-gray-300 focus:outline-none focus:border-black"
                  aria-label="Phone number for SMS"
                  required
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition"
                  aria-label="Subscribe to SMS updates"
                >
                  <FaPhone />
                </button>
              </form>
              {phoneSuccess && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <FaCheckCircle /> SMS subscription successful!
                </p>
              )}
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-bold text-sm mb-2">💬 WhatsApp</h3>
              <p className="text-xs text-gray-600 mb-3">Connect on WhatsApp</p>
              <form onSubmit={handleWhatsappSubmit} className="flex">
                <select
                  className="w-24 px-2 py-2.5 text-sm border border-gray-300 bg-white focus:outline-none focus:border-black"
                  aria-label="Country code"
                >
                  <option>CA +1</option>
                  <option>US +1</option>
                </select>
                <input
                  type="text"
                  placeholder="WhatsApp number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm border border-l-0 border-gray-300 focus:outline-none focus:border-black"
                  aria-label="WhatsApp account"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-green-700 transition"
                  aria-label="Subscribe to WhatsApp updates"
                >
                  <FaWhatsapp />
                </button>
              </form>
              {whatsappSuccess && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <FaCheckCircle /> WhatsApp subscription successful!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="hover:text-black hover:underline transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <div className="mb-8">
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-gray-900">
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-4 mb-6">
                {socialLinks.map(({ icon: Icon, name }) => (
                  <a
                    key={name}
                    href="#"
                    className="text-gray-600 hover:text-black transition-colors p-1 hover:scale-110 transform"
                    aria-label={`Visit our ${name} page`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Icon className="text-xl" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-900">
                Download App
              </h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-xs"
                  onClick={(e) => e.preventDefault()}
                >
                  <FaApple className="text-lg" />
                  <span>App Store</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-xs"
                  onClick={(e) => e.preventDefault()}
                >
                  <FaAndroid className="text-lg" />
                  <span>Google Play</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-900">
                We Accept
              </h3>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className={`
                      w-14 h-9 rounded flex items-center justify-center
                      ${method.color} 
                      ${method.border ? 'border border-gray-300' : ''}
                      ${method.textColor || 'text-white'}
                      text-xs font-bold shadow-sm hover:shadow-md transition-shadow
                    `}
                  >
                    {method.icon && <span>{method.icon}</span>}
                    {method.component && React.createElement(method.component, { className: 'text-lg' })}
                    {method.text && <span>{method.text}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <span>🔒 Secure SSL encrypted payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600 order-2 md:order-1">
              ©2009-2026 Unibuy. All Rights Reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs order-1 md:order-2">
              {bottomLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-600 hover:text-black hover:underline transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors z-40"
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
}
