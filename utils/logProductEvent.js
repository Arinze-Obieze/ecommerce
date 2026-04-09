// utils/logProductEvent.js
// Fires a product_events insert to Supabase REST API.
// Always silent on failure — never blocks the user action.

import { createClient } from '@/utils/supabase/client'

// Stable anonymous session ID — persists for the browser session
function getSessionId() {
  try {
    let id = sessionStorage.getItem('zova_session_id')
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('zova_session_id', id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

/**
 * Log a product interaction event to product_events table.
 *
 * @param {object} opts
 * @param {number|string} opts.productId  - products.id
 * @param {string}        opts.eventType  - 'view' | 'cart_add' | 'wishlist_save' |
 *                                          'wishlist_remove' | 'checkout_start' |
 *                                          'order_placed' | 'order_completed'
 * @param {string}        [opts.source]   - where this happened:
 *                                          'product_page' | 'homepage' | 'new_arrivals' |
 *                                          'trending' | 'best_sellers' | 'search' |
 *                                          'mood' | 'category' | 'quick_view'
 * @param {object}        [opts.metadata] - optional extra context
 */
export async function logProductEvent({
  productId,
  eventType,
  source = null,
  metadata = {},
}) {
  // Validate — never send garbage to the DB
  if (!productId || !eventType) {
    console.warn('[logProductEvent] Missing productId or eventType — skipped')
    return
  }

  try {
    const supabase   = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase
      .from('product_events')
      .insert({
        product_id:  Number(productId),
        user_id:     session?.user?.id ?? null,
        session_id:  getSessionId(),
        event_type:  eventType,
        source:      source ?? null,
        metadata:    Object.keys(metadata).length > 0 ? metadata : null,
        occurred_at: new Date().toISOString(),
      })

    if (error) {
      console.warn('[logProductEvent] Insert error:', error.message)
    }
  } catch (err) {
    console.warn('[logProductEvent] Unexpected error:', err?.message ?? err)
  }
}