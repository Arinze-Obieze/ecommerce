'use client';

import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/storage-keys';

function safeReadLocalStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readStorageWithMigration(nextKey, legacyKey) {
  const nextValue = safeReadLocalStorage(nextKey);
  if (nextValue) return nextValue;

  const legacyValue = safeReadLocalStorage(legacyKey);
  if (!legacyValue || typeof window === 'undefined') return legacyValue;

  try {
    localStorage.setItem(nextKey, legacyValue);
    localStorage.removeItem(legacyKey);
  } catch {}

  return legacyValue;
}

export function getRecommendationRequestHeaders(surface = 'browse') {
  const headers = {};

  const anonId = readStorageWithMigration(STORAGE_KEYS.ANON_ID, LEGACY_STORAGE_KEYS.ANON_ID);
  const sessionId = readStorageWithMigration(STORAGE_KEYS.SESSION_ID, LEGACY_STORAGE_KEYS.SESSION_ID);

  if (anonId) {
    headers['x-shophub-anon-id'] = anonId;
  }

  if (sessionId) {
    headers['x-shophub-session-id'] = sessionId;
  }

  if (surface) {
    headers['x-shophub-surface'] = surface;
  }

  return headers;
}
