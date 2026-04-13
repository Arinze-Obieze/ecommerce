import { notFound, redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/utils/supabase/server";

function normalizeCode(value) {
  return String(value || "").trim();
}

async function findProduct(adminClient, code) {
  const bySlug = await adminClient
    .from("products")
    .select("id, slug, store_id")
    .eq("slug", code)
    .limit(1)
    .maybeSingle();

  if (!bySlug.error && bySlug.data) {
    return bySlug.data;
  }

  const numericId = Number.parseInt(code, 10);
  if (Number.isFinite(numericId)) {
    const byId = await adminClient
      .from("products")
      .select("id, slug, store_id")
      .eq("id", numericId)
      .limit(1)
      .maybeSingle();

    if (!byId.error && byId.data) {
      return byId.data;
    }
  }

  const bySku = await adminClient
    .from("products")
    .select("id, slug, store_id, created_at")
    .eq("sku", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bySku.error) return null;
  return bySku.data || null;
}

export default async function QrProductResolverPage({ params }) {
  const rawCode = (await params)?.code;
  const code = normalizeCode(rawCode);
  if (!code) notFound();

  const adminClient = await createAdminClient();
  const product = await findProduct(adminClient, code);
  if (!product) notFound();

  const authClient = await createClient();
  const { data: authData } = await authClient.auth.getUser();
  const user = authData?.user || null;

  if (user) {
    const { data: membership } = await adminClient
      .from("store_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("store_id", product.store_id)
      .limit(1)
      .maybeSingle();

    if (membership?.id) {
      redirect(`/store/dashboard/products/${product.id}?mode=scan&from=qr`);
    }
  }

  if (product.slug) {
    redirect(`/products/${product.slug}`);
  }

  notFound();
}
