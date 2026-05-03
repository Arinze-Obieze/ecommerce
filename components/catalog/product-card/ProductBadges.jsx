'use client';

import { FiAward, FiTrendingUp } from 'react-icons/fi';

export function RankBadge({ rank }) {
  if (!rank) return null;

  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#c2d9b4] bg-(--zova-green-soft) px-1.5 py-0.5 text-[10px] font-semibold text-(--zova-primary-action)">
      {medals[rank] || <FiAward className="h-2.5 w-2.5" />}
      #{rank} in category
    </span>
  );
}

export function TrendingBadge({ velocity }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#f5d06e] bg-(--zova-accent-soft) px-2 py-0.5 text-[10px] font-semibold text-[#b87800]">
      <FiTrendingUp className="h-3 w-3" />
      Trending {velocity ? `· ${velocity}` : ''}
    </span>
  );
}
