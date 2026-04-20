'use client';

function safeReadLocalStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getRecommendationRequestHeaders(surface = 'browse') {
  const headers = {};

  const anonId = safeReadLocalStorage('shophub_anon_id');
  const sessionId = safeReadLocalStorage('shophub_session_id');

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
