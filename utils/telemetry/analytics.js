'use client';

import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/storage-keys';

function getOrCreateId(nextKey, legacyKey) {
  let id = localStorage.getItem(nextKey);
  if (id) return id;

  id = localStorage.getItem(legacyKey);
  if (id) {
    localStorage.setItem(nextKey, id);
    localStorage.removeItem(legacyKey);
    return id;
  }

  id = crypto.randomUUID();
  localStorage.setItem(nextKey, id);
  return id;
}

function getOrCreateSessionId() {
  return getOrCreateId(STORAGE_KEYS.SESSION_ID, LEGACY_STORAGE_KEYS.SESSION_ID);
}

function getOrCreateAnonId() {
  return getOrCreateId(STORAGE_KEYS.ANON_ID, LEGACY_STORAGE_KEYS.ANON_ID);
}

function detectDeviceType() {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth || 0;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export async function trackAnalyticsEvent(eventName, properties = {}) {
  if (typeof window === 'undefined') return;

  try {
    const payload = {
      event_name: eventName,
      session_id: getOrCreateSessionId(),
      anon_id: getOrCreateAnonId(),
      path: window.location.pathname,
      referrer: document.referrer || null,
      device_type: detectDeviceType(),
      properties,
    };

    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (response.status === 429) {
      const json = await response.json().catch(() => ({}));
      console.warn(json.error || 'Analytics tracking was rate limited. The user experience is not affected.');
    } else if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      console.warn(json.error || `Analytics tracking failed with status ${response.status}.`);
    }
  } catch (error) {
    // Do not block UX due to analytics failures.
    console.error('Analytics tracking failed:', error);
  }
}
