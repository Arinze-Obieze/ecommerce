'use client';

import Link from 'next/link';
import { FiTwitter, FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { BiLogoFlutter } from 'react-icons/bi';
import { SiJamstack } from 'react-icons/si';

const AuthFooter = () => {
  return (
    <div className="mt-12 text-center space-y-4 w-full max-w-2xl">
      <p className="inline-block bg-[#2E5C45] text-white px-6 py-2 rounded-full shadow-md font-medium text-sm">Naija Friendly • Secure & Safe</p>
      
      <div className="flex justify-center">
        <div className="flex items-center gap-4 text-sm bg-[#2E5C45] text-white px-6 py-2 rounded-full shadow-md">
           <Link href="#" className="hover:text-green-200 transition-colors">Privacy Policy</Link>
           <span>|</span>
           <Link href="#" className="hover:text-green-200 transition-colors">Terms of Service</Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-gray-700">
         <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm"><FiInstagram className="w-6 h-6" /></a>
         <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm"><FiTwitter className="w-6 h-6" /></a>
         <a href="#" className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-sm"><FiFacebook className="w-6 h-6" /></a>
      </div>

      <div className="flex justify-center">
         <div className="flex items-center gap-4 bg-[#2E5C45] text-white px-6 py-2 rounded-full shadow-md">
             <div className="flex items-center gap-1"><SiJamstack className="w-4 h-4" /><span className="text-xs font-bold">Paystack</span></div>
             <div className="flex items-center gap-1"><BiLogoFlutter className="w-4 h-4" /><span className="text-xs font-bold">Flutterwave</span></div>
             <FaCcVisa className="w-6 h-6" />
             <FaCcMastercard className="w-6 h-6" />
         </div>
      </div>

      <div className="flex justify-center mt-6">

      </div>
    </div>
  );
};

export default AuthFooter;
