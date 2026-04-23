"use client";
import React from 'react';
import { FiCheckCircle, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';

// Brand tokens — sourced from app/globals.css
const THEME = {
  bg:           '#FFFFFF',
  border:       'var(--zova-border)',
  iconBg:       'var(--zova-green-soft)',
  iconColor:    'var(--zova-primary-action)',
  titleColor:   'var(--zova-ink)',
  descColor:    'var(--zova-text-muted)',
  hoverBg:      'var(--zova-linen)',
  divider:      'var(--zova-border)',
  accentBar:    'var(--zova-primary-action)',
};

const features = [
  {
    icon: FiCheckCircle,
    title: "Verified Stores",
    description: "Every seller is vetted and trusted",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    description: "Nationwide shipping, every order",
  },
  {
    icon: FiShield,
    title: "Secure Payment",
    description: "Your transactions are 100% protected",
  },
  {
    icon: FiHeadphones,
    title: "24/7 Support",
    description: "Dedicated help whenever you need it",
  },
];

const TrustBar = () => {
  return (
    <section style={{ backgroundColor: THEME.bg, borderBottom: `1px solid ${THEME.border}` }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLast = index === features.length - 1;
            return (
              <div
                key={index}
                className="flex items-center gap-4 py-5 px-5 transition-colors duration-150 cursor-default"
                style={{
                  borderRight: !isLast ? `1px solid ${THEME.divider}` : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: THEME.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: THEME.iconColor }} />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-sm font-bold leading-tight" style={{ color: THEME.titleColor }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: THEME.descColor }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;