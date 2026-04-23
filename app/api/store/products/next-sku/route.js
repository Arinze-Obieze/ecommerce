// app/api/store/products/next-sku/route.js
import { NextResponse } from "next/server";
import { requireStoreApi, STORE_ROLES } from "@/utils/store/auth";

export async function GET(request) {
  try {
    const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
    if (!ctx.ok) return ctx.response;

    const prefix = new URL(request.url).searchParams.get("prefix");
    if (!prefix?.startsWith("ZVA-")) return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });

    const { data } = await ctx.adminClient
      .from("products_internal").select("base_sku")
      .like("base_sku", `${prefix}-%`)
      .order("base_sku", { ascending: false }).limit(1);

    let seq = 1;
    if (data?.length) {
      const last = parseInt(data[0].base_sku.split("-").pop(), 10);
      if (!isNaN(last)) seq = last + 1;
    }

    return NextResponse.json({ sku: `${prefix}-${String(seq).padStart(4, "0")}`, sequence: seq });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
