import { useEffect, useState } from 'react';

export function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mediaQuery.matches);

    const handleChange = (event) => setIsDesktop(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isDesktop;
}

export function buildGalleryMedia(product) {
  const imageItems = (product?.image_urls || [])
    .filter(Boolean)
    .map((url, index) => ({ id: `img-${index}`, type: 'image', url }));
  const videoItems = (product?.video_urls || [])
    .filter(Boolean)
    .map((url, index) => ({ id: `vid-${index}`, type: 'video', url }));

  return [...imageItems, ...videoItems];
}

export function getUniqueOptions(variants, key) {
  return [...new Set((variants || []).map((variant) => variant?.[key]).filter(Boolean))];
}

export function pickDefaultVariant(variants) {
  return variants?.find((variant) => Number(variant.stock_quantity) > 0) || variants?.[0] || null;
}

function formatSpecKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatSpecValue(value) {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    if (!value.length) return null;

    const parts = value
      .map((item) => {
        if (item && typeof item === 'object') {
          if (item.type && item.percent !== undefined) {
            return `${item.type} ${item.percent}%`;
          }

          return Object.values(item)
            .filter((entry) => entry !== null && entry !== undefined && entry !== '')
            .join(' ');
        }

        return String(item);
      })
      .filter(Boolean);

    return parts.length ? parts.join(', ') : null;
  }

  if (typeof value === 'object') {
    const parts = Object.entries(value)
      .map(([nestedKey, nestedValue]) => {
        const formattedValue = formatSpecValue(nestedValue);
        return formattedValue ? `${formatSpecKey(nestedKey)}: ${formattedValue}` : null;
      })
      .filter(Boolean);

    return parts.length ? parts.join(' · ') : null;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  const normalized = String(value).trim();
  if (!normalized) return null;

  if (/^[a-z][a-z0-9_]*$/.test(normalized)) {
    return normalized.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return normalized;
}

export function getSpecificationEntries(specifications) {
  if (!specifications) return [];

  if (typeof specifications === 'string') {
    return specifications
      .split('\n')
      .map((value, index) => ({
        key: `Detail ${index + 1}`,
        value: value.trim(),
      }))
      .filter((entry) => entry.value);
  }

  if (Array.isArray(specifications)) {
    return specifications
      .map((entry, index) => {
        if (!entry) return null;

        if (typeof entry === 'object') {
          const key = String(entry.key || `Detail ${index + 1}`).trim();
          const value = String(entry.value || '').trim();
          return value ? { key, value } : null;
        }

        const value = String(entry).trim();
        return value ? { key: `Detail ${index + 1}`, value } : null;
      })
      .filter(Boolean);
  }

  if (typeof specifications === 'object') {
    return Object.entries(specifications)
      .map(([key, value]) => {
        const formattedValue = formatSpecValue(value);
        return formattedValue ? { key: formatSpecKey(key), value: formattedValue } : null;
      })
      .filter(Boolean);
  }

  return [];
}
