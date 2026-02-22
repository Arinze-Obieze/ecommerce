// Footer.jsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { footerData } from '@/data/footerData';

const Footer = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white text-black pt-16 pb-10 px-4 md:px-12 lg:px-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 pb-12">
          
          {/* COLUMN 1 - COMPANY INFO */}
          <div>
            <h3 className="font-semibold text-sm tracking-wide mb-5 text-gray-900">
              {footerData.companyInfo.title}
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              {footerData.companyInfo.links.map((link, index) => (
                <li key={index} className="hover:text-black cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2 - HELP & SUPPORT */}
          <div>
            <h3 className="font-semibold text-sm tracking-wide mb-5 text-gray-900">
              {footerData.helpSupport.title}
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              {footerData.helpSupport.links.map((link, index) => (
                <li key={index} className="hover:text-black cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 - CUSTOMER CARE + FIND US ON + APP */}
          <div>
            {/* CUSTOMER CARE */}
            <h3 className="font-semibold text-sm tracking-wide mb-5 text-gray-900">
              {footerData.customerCare.title}
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600 mb-8">
              {footerData.customerCare.links.map((link, index) => (
                <li key={index} className="hover:text-black cursor-pointer">
                  {link}
                </li>
              ))}
            </ul>
            
            {/* FIND US ON with Social Icons */}
            <h3 className="font-semibold text-sm tracking-wide mb-4 text-gray-900">
              {footerData.findUsOn.title}
            </h3>
            <div className="flex space-x-4 mb-6">
              {footerData.findUsOn.socialIcons.map((social, index) => (
                <div 
                  key={index}
                  className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs hover:bg-gray-300 cursor-pointer"
                >
                  {social.icon}
                </div>
              ))}
            </div>
            
            {/* APP */}
            <div className="text-xs font-medium text-gray-900 mb-2">
              {footerData.findUsOn.app.title}
            </div>
            <div className="flex space-x-2">
              {footerData.findUsOn.app.stores.map((store, index) => (
                <div 
                  key={index}
                  className="h-8 w-20 bg-gray-200 rounded text-[8px] flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                >
                  {store.name}
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 4 - SIGN UP FOR SHEIN STYLE NEWS */}
          <div>
            <h3 className="font-semibold text-sm tracking-wide mb-5 text-gray-900">
              {footerData.newsletter.title}
            </h3>
            
            {footerData.newsletter.subscriptions.map((sub, index) => (
              <div key={index} className={index < footerData.newsletter.subscriptions.length - 1 ? "mb-4" : ""}>
                <div className="flex border border-gray-300">
                  {sub.countryCode && (
                    <div className="flex items-center px-3 py-2.5 text-xs text-gray-700 bg-gray-50 border-r border-gray-300">
                      {sub.countryCode}
                    </div>
                  )}
                  <input 
                    type={sub.type === "email" ? "email" : "text"}
                    placeholder={sub.placeholder}
                    className="flex-1 px-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <button className="px-5 text-xs font-medium border-l border-gray-300 bg-white hover:bg-gray-50">
                    {sub.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMN 5 - WE ACCEPT */}
          <div>
            <h3 className="font-semibold text-sm tracking-wide mb-5 text-gray-900">
              {footerData.paymentMethods.title}
            </h3>
            
            {/* Credit Card Icons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {footerData.paymentMethods.cards.map((card, index) => (
                <div 
                  key={index}
                  className="h-6 w-10 bg-gray-200 rounded text-[8px] flex items-center justify-center hover:bg-gray-300 cursor-pointer"
                >
                  {card === "VISA" ? "VISA" : 
                   card === "Mastercard" ? "MC" :
                   card === "Discover" ? "Disc" :
                   card === "JCB" ? "JCB" :
                   card === "PayPal" ? "PP" :
                   card === "Apple Pay" ? "AP" :
                   card === "Google Pay" ? "GP" :
                   card === "WeChat Pay" ? "WX" :
                   card === "Alipay" ? "Ali" :
                   card === "UnionPay" ? "UP" : card}
                </div>
              ))}
            </div>
            
            {/* Banks List */}
            <div className="text-xs text-gray-700 space-y-1.5">
              {footerData.paymentMethods.banks.map((bank, index) => (
                <div key={index}>{bank}</div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-gray-200 pt-7 mt-2">
          <div className="text-xs text-gray-500 text-center mb-4">
            {footerData.bottomBar.copyright}
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            {footerData.bottomBar.legalLinks.map((link, index) => (
              <React.Fragment key={index}>
                <span className="hover:text-black cursor-pointer">{link}</span>
                {index < footerData.bottomBar.legalLinks.length - 1 && (
                  <span className="text-gray-300">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
