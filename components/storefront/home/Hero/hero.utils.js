export function normalizeBanner(rawBanner) {
  if (!rawBanner) return null;

  return {
    ...rawBanner,
    background_image: rawBanner.background_image || rawBanner.backgroundImage || null,
  };
}

export function formatSellerCount(count) {
  if (count >= 10000) return `${Math.floor(count / 1000)}K+`;
  if (count >= 1000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K+`;
  if (count > 0) return `${count.toLocaleString()}+`;
  return '';
}
