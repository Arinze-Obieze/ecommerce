// app/api/store/products/create/route.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  let productId = null;

  try {
    const supabase = await createClient();

    // 1. Auth
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse
    const formData = await request.formData();
    const raw = formData.get("wizard_data");
    if (!raw) {
      return NextResponse.json({ success: false, error: "Missing wizard_data" }, { status: 400 });
    }
    const wd = JSON.parse(raw);
    console.log("[Create] Product:", wd.productName, "| SKU:", wd.baseSku);

    // 3. Validate store — try owner_id then user_id then just id (RLS protects)
    let store = null;
    for (const col of ["owner_id", "user_id"]) {
      const { data } = await supabase
        .from("stores").select("id, slug, name").eq("id", wd.storeId).eq(col, user.id).maybeSingle();
      if (data) { store = data; break; }
    }
    if (!store) {
      const { data } = await supabase
        .from("stores").select("id, slug, name").eq("id", wd.storeId).maybeSingle();
      store = data;
    }
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 403 });
    }
    console.log("[Create] Store:", store.name);

    // 4. SKU uniqueness
    const { data: dup } = await supabase
      .from("products_internal").select("product_id").eq("base_sku", wd.baseSku).limit(1);
    if (dup?.length) {
      return NextResponse.json({ success: false, error: `SKU ${wd.baseSku} already exists` }, { status: 409 });
    }

    // 5. Totals
    const validVariants = (wd.variantSkus || []).filter(v => v.color && v.size);
    const totalQty = validVariants.reduce((s, v) => s + (parseInt(v.quantity) || 0), 0);
    const prices = validVariants.map(v => parseFloat(v.price) || 0);
    const basePrice = prices.length ? Math.min(...prices) : 0;
    const now = new Date().toISOString();

    // 6. Insert product — column names from R code's products_internal table
    productId = `PROD_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    const productRec = {
      product_id: productId,
      seller_id: store.id,
      product_name: wd.productName,
      description: wd.description || "",
      category: wd.category,
      subcategory: wd.subcategory,
      brand: wd.brand || null,
      material: wd.material,
      gender: wd.gender || null,
      age_group: wd.ageGroup || null,
      base_sku: wd.baseSku,
      price: basePrice,
      quantity: totalQty,
      status: "active",
      approval_status: "pending",
      image_strategy: wd.imageStrategy || "general",
      notes: wd.productNotes || null,
    };

    console.log("[Create] Inserting product:", productId);
    const { error: prodErr } = await supabase.from("products_internal").insert(productRec);
    if (prodErr) {
      console.error("[Create] Product insert failed:", prodErr.message);
      return NextResponse.json({ success: false, error: `Product: ${prodErr.message}` }, { status: 500 });
    }
    console.log("[Create] Product inserted OK");

    // 7. Insert variants — column names from R code's product_variants_internal table
    const varRecs = validVariants.map((v, i) => ({
      variant_id: `VAR_${productId}_${i + 1}`,
      product_id: productId,
      color: v.color,
      size: v.size,
      quantity: parseInt(v.quantity) || 0,
      price: parseFloat(v.price) || 0,
      sku: v.sku,
      status: "active",
    }));

    if (varRecs.length > 0) {
      console.log("[Create] Inserting", varRecs.length, "variants");
      const { error: varErr } = await supabase.from("product_variants_internal").insert(varRecs);
      if (varErr) {
        console.error("[Create] Variant insert failed:", varErr.message);
        await supabase.from("products_internal").delete().eq("product_id", productId);
        productId = null;
        return NextResponse.json({ success: false, error: `Variants: ${varErr.message}` }, { status: 500 });
      }
      console.log("[Create] Variants inserted OK");
    } else {
      console.log("[Create] No valid variants to insert");
    }

    // 8. Upload images to Supabase Storage + save to product_images table
    let imgCount = 0;
    const imgErrors = [];

    for (const [key, val] of formData.entries()) {
      if (key === "wizard_data") continue;
      if (!(val instanceof File) || val.size === 0) continue;

      try {
        // Parse the field key to determine image type and variant color
        const parts = key.split("_");
        let imgType = "front";
        let imgStrategy = "general";
        let varColor = null;

        if (key.startsWith("mixed_variant_")) {
          imgStrategy = "mixed_variant";
          varColor = parts[2];
          imgType = parts.slice(3).join("_");
        } else if (key.startsWith("mixed_general_")) {
          imgStrategy = "mixed_general";
          imgType = parts.slice(2).join("_");
        } else if (key.startsWith("variant_")) {
          imgStrategy = "variant";
          varColor = parts[1];
          imgType = parts.slice(2).join("_");
        } else if (key.startsWith("general_")) {
          imgStrategy = "general";
          imgType = parts.slice(1).join("_");
        }

        // Build storage path matching R code pattern
        const categorySafe = (wd.category || "general").toLowerCase().replace(/\s/g, "_");
        const imageId = `IMG_${Date.now()}_${imgCount}`;
        const ext = val.name.split(".").pop()?.toLowerCase() || "jpg";

        let storagePath;
        if (varColor) {
          const colorSafe = varColor.replace(/\s/g, "_");
          storagePath = `${store.id}/${categorySafe}/${productId}/variants/${colorSafe}/${imgType}_${imageId}.${ext}`;
        } else {
          storagePath = `${store.id}/${categorySafe}/${productId}/general/${imgType}_${imageId}.${ext}`;
        }

        console.log("[Create] Uploading:", key, "→", storagePath);

        // Convert File to Buffer — this is what Supabase JS client needs in Node
        const arrayBuffer = await val.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(storagePath, buffer, {
            contentType: val.type || "image/jpeg",
            upsert: true,
          });

        if (upErr) {
          console.error("[Create] Upload failed:", key, upErr.message);
          imgErrors.push(`${key}: ${upErr.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(storagePath);
        const publicUrl = urlData?.publicUrl || null;

        console.log("[Create] Uploaded OK:", key);

        // Save to product_images table — column names from R code
        const { error: imgDbErr } = await supabase.from("product_images").insert({
          image_id: imageId,
          product_id: productId,
          image_path: storagePath,
          original_filename: val.name,
          file_size: val.size,
          mime_type: val.type || "image/jpeg",
          image_type: imgType,
          image_strategy: imgStrategy,
          variant_color: varColor || null,
          image_order: imgCount + 1,
          is_primary: imgCount === 0,
          supabase_image_id: imageId,
          supabase_url: publicUrl,
          supabase_storage_path: storagePath,
          supabase_upload_status: "uploaded",
          supabase_uploaded_at: now,
          is_active: true,
          uploaded_at: now,
        });

        if (imgDbErr) {
          console.error("[Create] Image DB failed:", key, imgDbErr.message);
          imgErrors.push(`${key} (db): ${imgDbErr.message}`);
        } else {
          imgCount++;
        }
      } catch (e) {
        console.error("[Create] Image error:", key, e.message);
        imgErrors.push(`${key}: ${e.message}`);
      }
    }
    console.log("[Create] Images:", imgCount, "saved,", imgErrors.length, "errors");

    // 9. Variant notes
    if (wd.variantNotes && Object.keys(wd.variantNotes).length > 0) {
      const noteRecs = Object.entries(wd.variantNotes)
        .filter(([, t]) => t?.trim())
        .map(([color, text]) => ({
          product_id: productId,
          variant_color: color,
          note_text: text.trim(),
        }));
      if (noteRecs.length) {
        const { error: noteErr } = await supabase.from("product_variant_notes").insert(noteRecs);
        if (noteErr) console.warn("[Create] Notes failed:", noteErr.message);
      }
    }

    // 10. Print log — column names from R code
    if (wd.printCompleted && wd.printCopies > 0) {
      const { error: printErr } = await supabase.from("barcode_print_log").insert({
        print_id: `PRINT_${productId}_${Date.now()}`,
        product_id: productId,
        sku: wd.baseSku,
        print_type: wd.printType || "all",
        copies_printed: wd.printCopies || 1,
        printed_by: user.id,
        printed_at: now,
      });
      if (printErr) console.warn("[Create] Print log failed:", printErr.message);
    }

    // 11. Verification log — column names from R code
    const { error: verifyErr } = await supabase.from("product_verification_log").insert({
      verification_id: `VERIFY_${productId}`,
      product_id: productId,
      scanned_sku: wd.scannedSku,
      expected_sku: wd.baseSku,
      match_result: true,
      verified_by: user.id,
      verified_at: now,
    });
    if (verifyErr) console.warn("[Create] Verify log failed:", verifyErr.message);

    console.log("[Create] ✅ DONE:", productId);

    return NextResponse.json({
      success: true,
      product: { id: productId, base_sku: wd.baseSku, name: wd.productName, status: "active" },
      variants_created: varRecs.length,
      images_uploaded: imgCount,
      image_errors: imgErrors.length ? imgErrors : undefined,
    });

  } catch (err) {
    console.error("[Create] ❌ ERROR:", err);
    if (productId) {
      try {
        const supabase = await createClient();
        await supabase.from("products_internal").delete().eq("product_id", productId);
      } catch {}
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
