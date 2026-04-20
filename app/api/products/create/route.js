// app/api/seller/products/create/route.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getGenderValidationError, normalizeGenderForCategory } from "@/features/product-wizard/lib/category-gender-rules";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request) {
  try {
    const supabase = await createClient();

    // ── 1. Authenticate ──────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── 2. Parse form data ───────────────────────────────────
    const formData = await request.formData();
    const wizardDataStr = formData.get("wizard_data");

    if (!wizardDataStr) {
      return NextResponse.json(
        { success: false, error: "Missing wizard_data" },
        { status: 400 }
      );
    }

    const wd = JSON.parse(wizardDataStr);
    const genderError = getGenderValidationError(wd.category, wd.gender);
    if (genderError) {
      return NextResponse.json(
        { success: false, error: genderError },
        { status: 400 }
      );
    }
    const normalizedGender = normalizeGenderForCategory(wd.category, wd.gender);
    const normalizedAgeGroup = String(wd.category || "").trim().toLowerCase() === "kids" ? (wd.ageGroup || null) : null;

    // ── 3. Validate store ownership ──────────────────────────
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, slug, name")
      .eq("id", wd.storeId)
      .eq("owner_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { success: false, error: "Store not found or not owned by you" },
        { status: 403 }
      );
    }

    // ── 4. Check SKU uniqueness ──────────────────────────────
    const { data: existingSku } = await supabase
      .from("products_internal")
      .select("id")
      .eq("base_sku", wd.baseSku)
      .limit(1);

    if (existingSku && existingSku.length > 0) {
      return NextResponse.json(
        { success: false, error: `SKU ${wd.baseSku} already exists. Please regenerate.` },
        { status: 409 }
      );
    }

    // ── 5. Calculate totals ──────────────────────────────────
    const totalQuantity = (wd.variants || []).reduce(
      (sum, v) => sum + (parseInt(v.quantity) || 0),
      0
    );
    const prices = (wd.variants || []).map((v) => parseFloat(v.price) || 0);
    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

    const productSlug = slugify(wd.productName);
    const now = new Date().toISOString();

    // ── 6. Insert product ────────────────────────────────────
    const productRecord = {
      store_id: store.id,
      name: wd.productName,
      slug: productSlug,
      description: wd.description || "",
      category: wd.category,
      subcategory: wd.subcategory,
      brand: wd.brand || null,
      material: wd.material,
      gender: normalizedGender || null,
      age_group: normalizedAgeGroup,
      base_sku: wd.baseSku,
      base_price: basePrice,
      total_quantity: totalQuantity,
      status: "active",
      approval_status: "pending",
      image_strategy: wd.imageStrategy || "general",
      notes: wd.productNotes || null,
      is_verified: true,
      verified_at: now,
      created_at: now,
      updated_at: now,
    };

    const { data: insertedProduct, error: productError } = await supabase
      .from("products_internal")
      .insert(productRecord)
      .select("id")
      .single();

    if (productError) {
      console.error("Product insert error:", productError);
      return NextResponse.json(
        { success: false, error: `Product save failed: ${productError.message}` },
        { status: 500 }
      );
    }

    const productId = insertedProduct.id;

    // ── 7. Insert variants ───────────────────────────────────
    const variantRecords = (wd.variantSkus || []).map((v, i) => ({
      product_id: productId,
      color: v.color,
      size: v.size,
      quantity: parseInt(v.quantity) || 0,
      price: parseFloat(v.price) || 0,
      sku: v.sku,
      status: "active",
      created_at: now,
    }));

    let variantsCreated = 0;
    if (variantRecords.length > 0) {
      const { data: insertedVariants, error: variantError } = await supabase
        .from("product_variants_internal")
        .insert(variantRecords)
        .select("id");

      if (variantError) {
        console.error("Variant insert error:", variantError);
        // Rollback product
        await supabase.from("products_internal").delete().eq("id", productId);
        return NextResponse.json(
          { success: false, error: `Variant save failed: ${variantError.message}` },
          { status: 500 }
        );
      }
      variantsCreated = insertedVariants?.length || 0;
    }

    // ── 8. Upload images to Supabase Storage ─────────────────
    let imagesUploaded = 0;
    const imageErrors = [];

    for (const [key, value] of formData.entries()) {
      if (key === "wizard_data") continue;
      if (!(value instanceof File) || value.size === 0) continue;

      try {
        // Parse key to extract image_type and variant_color
        // Keys look like: general_front, variant_Black_back, mixed_general_front, etc.
        const parts = key.split("_");
        let imageType = "front";
        let imageStrategy = "general";
        let variantColor = null;

        if (key.startsWith("general_")) {
          imageStrategy = "general";
          imageType = parts.slice(1).join("_");
        } else if (key.startsWith("variant_")) {
          imageStrategy = "variant";
          variantColor = parts[1];
          imageType = parts.slice(2).join("_");
        } else if (key.startsWith("mixed_general_")) {
          imageStrategy = "mixed_general";
          imageType = parts.slice(2).join("_");
        } else if (key.startsWith("mixed_variant_")) {
          imageStrategy = "mixed_variant";
          variantColor = parts[2];
          imageType = parts.slice(3).join("_");
        }

        // Build storage path
        const ext = value.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const colorPart = variantColor ? `_${variantColor}` : "";
        const storagePath = `${store.id}/${productId}/${imageType}${colorPart}_${timestamp}.${ext}`;

        // Read file as ArrayBuffer
        const arrayBuffer = await value.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, fileBuffer, {
            contentType: value.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          imageErrors.push(`${key}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(storagePath);

        // Insert image record
        await supabase.from("product_images").insert({
          product_id: productId,
          storage_path: storagePath,
          public_url: publicUrl,
          original_filename: value.name,
          file_size: value.size,
          mime_type: value.type || "image/jpeg",
          image_type: imageType,
          image_strategy: imageStrategy,
          variant_color: variantColor,
          display_order: imagesUploaded + 1,
          is_primary: imagesUploaded === 0,
          created_at: now,
        });

        imagesUploaded++;
      } catch (imgErr) {
        imageErrors.push(`${key}: ${imgErr.message}`);
      }
    }

    // ── 9. Insert variant notes ──────────────────────────────
    if (wd.variantNotes && Object.keys(wd.variantNotes).length > 0) {
      const noteRecords = Object.entries(wd.variantNotes)
        .filter(([_, text]) => text && text.trim())
        .map(([color, text]) => ({
          product_id: productId,
          variant_color: color,
          note_text: text.trim(),
          created_at: now,
        }));

      if (noteRecords.length > 0) {
        await supabase.from("product_variant_notes").insert(noteRecords);
      }
    }

    // ── 10. Insert print log ─────────────────────────────────
    if (wd.printCompleted && wd.printCopies > 0) {
      await supabase.from("barcode_print_log").insert({
        product_id: productId,
        variant_id: null,
        sku: wd.baseSku,
        print_type: wd.printType || "all",
        copies_printed: wd.printCopies || 1,
        printed_by: user.id,
        printed_at: now,
      });
    }

    // ── 11. Insert verification log ──────────────────────────
    await supabase.from("product_verification_log").insert({
      product_id: productId,
      scanned_sku: wd.scannedSku,
      expected_sku: wd.baseSku,
      match_result: true,
      verified_by: user.id,
      verified_at: now,
    });

    // ── 12. Return success ───────────────────────────────────
    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        base_sku: wd.baseSku,
        name: wd.productName,
        status: "active",
      },
      variants_created: variantsCreated,
      images_uploaded: imagesUploaded,
      image_errors: imageErrors.length > 0 ? imageErrors : undefined,
    });
  } catch (err) {
    console.error("Unhandled error in product create:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
