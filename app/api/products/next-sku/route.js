// app/api/seller/products/next-sku/route.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix");

    if (!prefix || !prefix.startsWith("ZVA-")) {
      return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });
    }

    // Find highest existing sequence for this prefix
    const { data, error } = await supabase
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
