// app/api/seller/products/next-sku/route.js
import { NextResponse } from "next/server";
import { requireStoreApi, STORE_ROLES } from "@/utils/store/auth";

export async function GET(request) {
  try {
    const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
    if (!ctx.ok) return ctx.response;

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix");

    if (!prefix || !prefix.startsWith("ZVA-")) {
      return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });
    }

    // Find highest existing sequence for this prefix
    const { data, error } = await ctx.adminClient
      .from("products_internal")
      .select("base_sku")
      .like("base_sku", `${prefix}-%`)
      .order("base_sku", { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (!error && data && data.length > 0) {
      const lastSku = data[0].base_sku;
      const parts = lastSku.split("-");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextSeq = lastNum + 1;
    }

    const seqStr = String(nextSeq).padStart(4, "0");
    const fullSku = `${prefix}-${seqStr}`;

    return NextResponse.json({ sku: fullSku, sequence: nextSeq });
  } catch (err) {
    console.error("next-sku error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
