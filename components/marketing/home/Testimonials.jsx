"use client";
import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

// ============================================================
// 🎨 THEME
// ============================================================
const THEME = {
  sectionBg:      "#F9FAFB",
  sectionBorder:  "#F0F0F0",

  headingText:    "#111111",
  subText:        "#888888",
  accentText:     "#00B86B",

  cardBg:         "#FFFFFF",
  cardBorder:     "#F0F0F0",
  cardShadow:     "0 1px 4px rgba(0,0,0,0.05)",
  cardHoverShadow:"0 8px 24px rgba(0,0,0,0.08)",

  quoteColor:     "rgba(0,184,107,0.08)",
  bodyText:       "#444444",

  starFill:       "#F59E0B",
  starEmpty:      "#E5E7EB",

  avatarBorder:   "#EDFAF3",
  nameText:       "#111111",
  roleText:       "#AAAAAA",

  tagBg:          "#EDFAF3",
  tagText:        "#0A3D2E",
  tagBorder:      "#A8DFC4",
};
// ============================================================

const reviews = [
  {
    id: 1,
    name: "Sarah A.",
    role: "Fashion Enthusiast",
    content: "The quality of clothes I bought here is amazing! Fast delivery and exactly as described. Will definitely be shopping here again.",
    rating: 5,
    tag: "Quality",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Michael O.",
    role: "Frequent Shopper",
    content: "Finally a platform where I can trust the stores. The verification process really makes a difference — every purchase has been smooth.",
    rating: 5,
    tag: "Trust",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Chidinma K.",
    role: "Style Influencer",
    content: "I love the variety of categories. Found unique pieces I couldn't find anywhere else, and the stores are all super responsive.",
    rating: 4,
    tag: "Variety",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className="w-3.5 h-3.5"
          style={{ color: i < rating ? THEME.starFill : THEME.starEmpty, fill: i < rating ? THEME.starFill : 'none' }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col rounded-2xl p-6 transition-all duration-200 relative overflow-hidden min-w-[85%] md:min-w-0 snap-center"
      style={{
        backgroundColor: THEME.cardBg,
        border: `1px solid ${THEME.cardBorder}`,
        boxShadow: hovered ? THEME.cardHoverShadow : THEME.cardShadow,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Large decorative quote mark */}
      <div
        className="absolute top-4 right-5 text-8xl font-serif leading-none pointer-events-none select-none"
        style={{ color: THEME.quoteColor }}
      >
        "
      </div>

      {/* Top row: stars + tag */}
      <div className="flex items-center justify-between mb-4">
        <StarRating rating={review.rating} />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: THEME.tagBg, color: THEME.tagText, border: `1px solid ${THEME.tagBorder}` }}
        >
          {review.tag}
        </span>
      </div>

      {/* Review text */}
      <p className="text-sm leading-relaxed flex-1 relative z-10" style={{ color: THEME.bodyText }}>
        "{review.content}"
      </p>

      {/* Divider */}
      <div className="my-4 h-px" style={{ backgroundColor: THEME.cardBorder }} />

      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={review.image}
          alt={review.name}
          className="w-10 h-10 rounded-full object-cover"
          style={{ border: `2px solid ${THEME.avatarBorder}` }}
        />
        <div>
          <p className="text-sm font-bold" style={{ color: THEME.nameText }}>{review.name}</p>
          <p className="text-[11px]" style={{ color: THEME.roleText }}>{review.role}</p>
        </div>
        {/* Verified purchase dot */}
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accentText }} />
          <span className="text-[10px] font-medium" style={{ color: THEME.accentText }}>Verified</span>
        </div>
      </div>
    </div>
  );
}

const Testimonials = () => {
  return (
    <section style={{ backgroundColor: THEME.sectionBg, borderTop: `1px solid ${THEME.sectionBorder}`, borderBottom: `1px solid ${THEME.sectionBorder}` }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-black uppercase tracking-[0.2em] mb-3"
            style={{ color: THEME.accentText }}
          >
            Customer Reviews
          </span>
          <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: THEME.headingText }}>
            What Our Customers Say
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: THEME.subText }}>
            Join thousands of satisfied shoppers who found their perfect style with us.
          </p>

          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="w-4 h-4" style={{ color: THEME.starFill, fill: THEME.starFill }} />
              ))}
            </div>
            <span className="text-sm font-black" style={{ color: THEME.headingText }}>4.9</span>
            <span className="text-sm" style={{ color: THEME.subText }}>from 10,000+ reviews</span>
          </div>
        </div>

        {/* Cards */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-5 pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;