"use client";

import { EXPLORE_PRODUCTS_SKELETON_COUNT } from '@/constants/explore-products';

function PlaceholderCard({ delay = 0 }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-(--zova-border) bg-white animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-full"
        style={{ background: 'var(--zova-surface-alt)', aspectRatio: '3/4' }}
      />
      <div className="px-3 py-[10px] pb-3">
        <div
          className="mb-1.5 rounded"
          style={{ height: 8, width: '60%', background: 'var(--zova-surface-alt)' }}
        />
        <div
          className="mb-2 rounded"
          style={{ height: 11, width: '85%', background: 'var(--zova-surface-alt)' }}
        />
        <div
          className="mb-2.5 rounded"
          style={{ height: 11, width: '45%', background: 'var(--zova-surface-alt)' }}
        />
        <div
          className="w-full rounded-lg"
          style={{ height: 30, background: 'var(--zova-surface-alt)' }}
        />
      </div>
    </div>
  );
}

export default function ExploreSectionPlaceholder() {
  return (
    <section
      className="bg-(--zova-linen)"
      style={{ padding: '16px 0 56px' }}
    >
      <div
        className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-9 text-center">
          <div className="mb-2.5 flex items-center justify-center gap-2">
            <div className="h-[2px] w-6 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-28 rounded bg-gray-100 animate-pulse" />
            <div className="h-[2px] w-6 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="mx-auto mb-3 h-8 w-64 rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto mb-[18px] h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
          <div className="mx-auto h-4 w-36 rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5">
          {Array.from({ length: EXPLORE_PRODUCTS_SKELETON_COUNT }, (_, index) => (
            <PlaceholderCard key={index} delay={index * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}
