import { requireStorePage, STORE_ROLES } from "@/utils/store/auth";
import ProductsClientView from "@/app/(store-console)/store/dashboard/products/ProductsClientView";

const PRODUCT_LIST_SELECT =
  "id, store_id, name, slug, sku, description, price, discount_price, specifications, bulk_discount_tiers, stock_quantity, image_urls, video_urls, is_active, moderation_status, submitted_at, reviewed_at, rejection_reason, created_at, updated_at";
const PRODUCT_LIST_SELECT_FALLBACK =
  "id, store_id, name, slug, sku, description, price, discount_price, specifications, stock_quantity, image_urls, video_urls, is_active, moderation_status, submitted_at, reviewed_at, rejection_reason, created_at, updated_at";

function isMissingBulkDiscountColumnError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "42703" ||
    (message.includes("bulk_discount_tiers") &&
      message.includes("does not exist"))
  );
}

export const metadata = {
  title: "Products Dashboard | Store Admin",
};

export default async function StoreProductsPage(props) {
  const searchParams = await props.searchParams;
  const { adminClient, membership } = await requireStorePage([
    STORE_ROLES.OWNER,
    STORE_ROLES.MANAGER,
    STORE_ROLES.STAFF,
  ]);

  const moderationStatus =
    searchParams?.moderationStatus === "draft" ||
    searchParams?.moderationStatus === "pending_review" ||
    searchParams?.moderationStatus === "approved" ||
    searchParams?.moderationStatus === "rejected" ||
    searchParams?.moderationStatus === "archived"
      ? searchParams.moderationStatus
      : "";

  const search = searchParams?.search ? searchParams.search.trim() : "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams?.limit || "20", 10))
  );
  const offset = (page - 1) * limit;

  // 1) Fetch Summary Stats
  const { data: summaryData } = await adminClient
    .from("products")
    .select("moderation_status")
    .eq("store_id", membership.store_id);

  const stats = summaryData || [];
  const summary = {
    total: stats.length,
    draft: stats.filter((p) => p.moderation_status === "draft").length,
    pending_review: stats.filter((p) => p.moderation_status === "pending_review")
      .length,
    approved: stats.filter((p) => p.moderation_status === "approved").length,
    rejected: stats.filter((p) => p.moderation_status === "rejected").length,
    archived: stats.filter((p) => p.moderation_status === "archived").length,
  };

  // 2) Fetch Products
  let query = adminClient
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (moderationStatus) {
    query = query.eq("moderation_status", moderationStatus);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  let { data: initialProducts, error } = await query;

  if (error && isMissingBulkDiscountColumnError(error)) {
    let fallbackQuery = adminClient
      .from("products")
      .select(PRODUCT_LIST_SELECT_FALLBACK)
      .eq("store_id", membership.store_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (moderationStatus) fallbackQuery = fallbackQuery.eq("moderation_status", moderationStatus);
    if (search) fallbackQuery = fallbackQuery.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);

    const fallbackResult = await fallbackQuery;
    initialProducts = (fallbackResult.data || []).map((row) => ({
      ...row,
      bulk_discount_tiers: null,
    }));
  }

  return (
    <ProductsClientView
      initialProducts={initialProducts || []}
      initialSummary={summary}
      initialDraft={null} 
    />
  );
}
