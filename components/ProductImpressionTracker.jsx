"use client";

import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '@/utils/analytics';

function getStorageKey(productId, surface, position) {
  return `shophub_impression:${surface || 'unknown'}:${productId}:${position ?? 'na'}`;
}

export default function ProductImpressionTracker({
  product,
  surface = 'browse',
  position = null,
  metadata = {},
  children,
}) {
  const rootRef = useRef(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !product?.id) return;

    const storageKey = getStorageKey(product.id, surface, position);
    try {
      if (sessionStorage.getItem(storageKey)) {
        hasTrackedRef.current = true;
        return;
      }
    } catch {
      // Ignore sessionStorage errors and fall back to runtime guard only.
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || hasTrackedRef.current) return;

        hasTrackedRef.current = true;

        try {
          sessionStorage.setItem(storageKey, '1');
        } catch {
          // Ignore storage failures.
        }

        trackAnalyticsEvent('product_impression', {
          product_id: product.id,
          product_name: product.name,
          store_id: product.store_id || null,
          position,
          surface,
          price: Number(product.discount_price || product.price || 0),
          category: product.categories?.[0]?.slug || product.categories?.[0]?.name || null,
          sort_strategy: metadata.sortStrategy || null,
          persona: metadata.persona || null,
        });

        observer.disconnect();
      },
      {
        threshold: 0.45,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [metadata.persona, metadata.sortStrategy, position, product, surface]);

  return <div ref={rootRef}>{children}</div>;
}
