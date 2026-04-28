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
} from "react-icons/fa";
import { FiCheckCircle, FiHeadphones, FiShield } from "react-icons/fi";

export const NAV_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Shop", href: "/shop" },
      { label: "Stores", href: "/stores" },
      { label: "Top Stores", href: "/stores" },
      { label: "Seller Profiles", href: "/stores" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping Info", href: "/shipping-info" },
      { label: "Free Returns", href: "/return-policy" },
      { label: "How To Order", href: "/how-to-order" },
      { label: "How To Track", href: "/how-to-track" },
      { label: "Refund Policy", href: "/return-policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
      { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
      { label: "IP Notice", href: "/legal/ip-notice" },
      { label: "Ad Choice", href: "/legal/ad-choice" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaFacebook, label: "Facebook" },
  { Icon: FaTiktok, label: "TikTok" },
  { Icon: FaTwitter, label: "Twitter" },
  { Icon: FaYoutube, label: "YouTube" },
  { Icon: FaPinterest, label: "Pinterest" },
  { Icon: FaSnapchat, label: "Snapchat" },
];

export const APP_LINKS = [
  { Icon: FaApple, label: "App Store" },
  { Icon: FaAndroid, label: "Google Play" },
];

export const PAYMENT_ICONS = [
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaCcDiscover,
];

export const TRUST_BADGES = [
  { Icon: FiShield, text: "Secure Checkout" },
  { Icon: FiCheckCircle, text: "Verified Sellers" },
  { icon: "🚚", text: "Free Returns" },
  { Icon: FiHeadphones, text: "Customer Support" },
];

export const BOTTOM_LINKS = [
  { label: "Privacy Center", href: "/legal/privacy-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "IP Notice", href: "/legal/ip-notice" },
  { label: "Ad Choice", href: "/legal/ad-choice" },
];
