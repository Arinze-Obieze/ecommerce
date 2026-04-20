// utils/getProductPromotions.js

/**
 * Fetches all currently active promotions from the DB once.
 * No targeting_mode or promotion_rules columns — matching mirrors
 * the compute_best_discount_price SQL trigger logic exactly.
 */
export async function fetchActivePromotions(supabase) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select(`
      id,
      display_name,
      display_tag,
      owner_type,
      store_id,
      applies_to,
      discount_type,
      discount_value,
      max_discount_cap,
      buy_x_quantity,
      get_y_quantity,
      show_savings_amount,
      badge_bg_color,
      badge_text_color,
      tag_bg_color,
      tag_text_color,
      priority,
      promotion_targets ( target_type, target_id )
    `)
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .or("owner_type.eq.zova,approved_by_zova.eq.true")
    .order("priority", { ascending: false });

  if (error || !data?.length) return [];
  return data;
}

/**
 * Given the full promotions list and one product,
 * returns the matching promotions for that product.
 *
 * Matching rules (same as compute_best_discount_price SQL function):
 *
 *  ① applies_to = 'all'                        → platform-wide, matches everything
 *  ② promotion_targets: target_type='product'  → matches this specific product
 *  ③ promotion_targets: target_type='category' → matches if product is in that category
 *  ④ promotion_targets: target_type='mood'     → matches if product has that mood tag
 *  ⑤ store_id matches + NO targets at all      → store-wide sale
 */
export function matchPromotionsForProduct(promotions, product) {
  if (!promotions?.length) return [];

  const productId    = String(product.id);
  const storeId      = String(product.store_id || product.stores?.id || "");

  const categorySlugs = (product.categories || [])
    .map(c => c?.slug)
    .filter(Boolean);

  const moodKeys = (product.mood_tags || [])
    .map(m => m?.mood_key || m)
    .filter(Boolean);

  return promotions.filter(promo => {
    const targets = promo.promotion_targets || [];

    // ① Platform-wide (Zova only)
    if (promo.applies_to === "all") return true;

    // ② Explicit product target
    if (targets.some(t => t.target_type === "product" && t.target_id === productId)) {
      return true;
    }

    // ③ Category target
    if (targets.some(t => t.target_type === "category" && categorySlugs.includes(t.target_id))) {
      return true;
    }

    // ④ Mood target
    if (targets.some(t => t.target_type === "mood" && moodKeys.includes(t.target_id))) {
      return true;
    }

    // ⑤ Store-wide ONLY when promotion has no explicit targets at all
    if (
      promo.store_id &&
      String(promo.store_id) === storeId &&
      targets.length === 0
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Attach promotions[] to every product in the array.
 * Fetches promotions once, matches per product — one DB round-trip regardless of page size.
 */
export async function attachPromotionsToProducts(supabase, products) {
  if (!products?.length) return products;

  try {
    const promotions = await fetchActivePromotions(supabase);
    return products.map(product => ({
      ...product,
      promotions: matchPromotionsForProduct(promotions, product),
    }));
  } catch (err) {
    console.error("[promotions] Failed to attach promotions:", err);
    return products.map(product => ({ ...product, promotions: [] }));
  }
}

/**
 * Compute the human-readable savings label for a promotion.
 * Exported so it can be reused in cart, checkout, and product detail.
 */
export function computeSavingsLabel(promo, productPrice) {
  if (!promo?.show_savings_amount) return null;
  const price = Number(productPrice || 0);

  if (promo.discount_type === "percentage") {
    let saved = price * (Number(promo.discount_value) / 100);
    if (promo.max_discount_cap) saved = Math.min(saved, Number(promo.max_discount_cap));
    if (saved <= 0) return null;
    return `Save ₦${Math.round(saved).toLocaleString("en-NG")}`;
  }

  if (promo.discount_type === "fixed_amount") {
    const saved = Number(promo.discount_value);
    if (saved <= 0) return null;
    return `Save ₦${saved.toLocaleString("en-NG")}`;
  }

  if (promo.discount_type === "free_shipping") return "Free Shipping";

  if (promo.discount_type === "buy_x_get_y") {
    return `Buy ${promo.buy_x_quantity} Get ${promo.get_y_quantity} Free`;
  }

  return null;
}