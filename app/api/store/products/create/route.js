// app/api/store/products/create/route.js
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { normalizeSpecifications } from "@/utils/productCatalog";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeVariantKey(color, size) {
  return `${normalizeText(color).toLowerCase()}__${normalizeText(size).toLowerCase()}`;
}

function buildVariantSku(baseSku, color, size) {
  const c3 = normalizeText(color).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3);
  const s = normalizeText(size).replace(/\s/g, "").toUpperCase();
  return `${baseSku}-${c3}-${s}`;
}

function normalizeManifest(manifest = {}) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return {};

  return Object.fromEntries(
    Object.entries(manifest)
      .map(([key, value]) => {
        if (!key || !value || typeof value !== "object") return null;
        const storagePath = normalizeText(value.storagePath || value.storage_path);
        if (!storagePath) return null;

        return [key, {
          publicUrl: normalizeText(value.publicUrl || value.public_url) || null,
          storagePath,
          originalFilename: normalizeText(value.originalFilename || value.original_filename) || null,
          mimeType: normalizeText(value.mimeType || value.mime_type) || null,
          sizeBytes: Math.max(0, Number.parseInt(value.sizeBytes || value.size_bytes, 10) || 0),
        }];
      })
      .filter(Boolean)
  );
}
function buildCareInstructionsJson(wd) {
  return {
    washing:         wd.careWashing      || null,
    bleaching:       wd.careBleaching    || null,
    drying:          wd.careDrying       || null,
    ironing:         wd.careIroning      || null,
    dry_cleaning:    wd.careDryCleaning  || null,
    children_safety: Array.isArray(wd.childrenSafetyFlags) ? wd.childrenSafetyFlags : [],
    flammability:    Array.isArray(wd.flammabilityFlags)   ? wd.flammabilityFlags   : [],
  };
}
 
function buildFiberComposition(wd) {
  if (!Array.isArray(wd.fiberComposition) || wd.fiberComposition.length === 0) return null;
  const valid = wd.fiberComposition.filter((f) => f.type && parseInt(f.percent) > 0);
  return valid.length > 0 ? valid : null;
}

function buildMergedNotes(wd) {
  const sections = [];
  const specificationSummary = normalizeText(wd.specificationSummary);
  const productNotes = normalizeText(wd.productNotes);
  const normalizedSpecifications = normalizeSpecifications(wd.specifications).value;

  if (specificationSummary) {
    sections.push(`Specification summary:\n${specificationSummary}`);
  }

  if (Array.isArray(normalizedSpecifications) && normalizedSpecifications.length > 0) {
    sections.push(`Structured specifications:\n${normalizedSpecifications.map((entry) => `- ${entry.key}: ${entry.value}`).join("\n")}`);
  }

  if (productNotes) {
    sections.push(`Internal notes:\n${productNotes}`);
  }

  return sections.join("\n\n") || null;
}


function getRequiredImageKeys(imageStrategy, colors) {
  if (imageStrategy === "variant") {
    return colors.flatMap((color) => {
      const safe = color.replace(/\s/g, "_");
      return [`variant_${safe}_front`, `variant_${safe}_back`];
    });
  }

  if (imageStrategy === "mixed") {
    return ["mixed_general_front", "mixed_general_back"];
  }

  return ["general_front", "general_back"];
}

async function cleanupCreatedRecords(supabase, productId, storagePaths = [], marketplaceSku = null) {
  if (!productId) return;

  if (storagePaths.length > 0) {
    try {
      await supabase.storage.from("product-images").remove(storagePaths);
    } catch {}
  }

  try {
    await supabase.from("product_images").delete().eq("product_id", productId);
  } catch {}

  try {
    await supabase.from("product_variants_internal").delete().eq("product_id", productId);
  } catch {}

  try {
    await supabase.from("products_internal").delete().eq("product_id", productId);
  } catch {}

  if (marketplaceSku) {
    try {
      await supabase.from("products").delete().eq("sku", marketplaceSku);
    } catch {}
  }
}

async function cleanupDraftRecord(supabase, draftId, storeId, userId, imageManifest = {}) {
  const manifestValues = Object.values(imageManifest || {}).filter(Boolean);
  const storagePaths = manifestValues.map((value) => value.storagePath).filter(Boolean);

  if (storagePaths.length > 0) {
    try {
      await supabase.storage.from("product-images").remove(storagePaths);
    } catch {}
  }

  if (!draftId) return;

  try {
    await supabase
      .from("product_creation_drafts")
      .delete()
      .eq("id", draftId)
      .eq("store_id", storeId)
      .eq("user_id", userId);
  } catch {}
}

export async function POST(request) {
  let productId = null;
  let uploadedStoragePaths = [];

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
    let wd;
    try {
      wd = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid wizard_data payload" }, { status: 400 });
    }
    console.log("[Create] Product:", wd.productName, "| SKU:", wd.baseSku);

    const baseSku = normalizeText(wd.baseSku);
    if (!baseSku) {
      return NextResponse.json({ success: false, error: "Missing base SKU" }, { status: 400 });
    }

    const productName = normalizeText(wd.productName);
    const description = normalizeText(wd.description);
    const material = normalizeText(wd.material);
    const category = normalizeText(wd.category);
    const subcategory = normalizeText(wd.subcategory);
    if (!productName || !description || !material || !category || !subcategory) {
      return NextResponse.json({ success: false, error: "Missing required product fields" }, { status: 400 });
    }

    const rawVariants = Array.isArray(wd.variants) ? wd.variants : [];
    const normalizedVariants = rawVariants.map((variant) => ({
      color: normalizeText(variant?.color),
      size: normalizeText(variant?.size),
      quantity: parseInt(variant?.quantity, 10) || 0,
      price: parseFloat(variant?.price) || 0,
    }));

    if (normalizedVariants.length === 0) {
      return NextResponse.json({ success: false, error: "At least one variant is required" }, { status: 400 });
    }

    if (normalizedVariants.some((variant) => !variant.color || !variant.size || variant.quantity <= 0 || variant.price <= 0)) {
      return NextResponse.json({ success: false, error: "Every variant must include color, size, quantity > 0, and price > 0" }, { status: 400 });
    }

    const duplicateKeys = new Set();
    const seenVariantKeys = new Set();
    normalizedVariants.forEach((variant) => {
      const key = normalizeVariantKey(variant.color, variant.size);
      if (seenVariantKeys.has(key)) duplicateKeys.add(key);
      seenVariantKeys.add(key);
    });
    if (duplicateKeys.size > 0) {
      return NextResponse.json({ success: false, error: "Duplicate color and size combinations are not allowed" }, { status: 400 });
    }

    const uniqueColors = [...new Set(normalizedVariants.map((variant) => variant.color))];
    const imageStrategy = normalizeText(wd.imageStrategy) || "general";
    if (imageStrategy === "variant" && uniqueColors.length === 0) {
      return NextResponse.json({ success: false, error: "Variant image strategy requires at least one color variant" }, { status: 400 });
    }

    const uploadedImageKeys = new Set();
    const persistedImages = normalizeManifest(wd.persistedImages || {});
    for (const [key, val] of formData.entries()) {
      if (key === "wizard_data") continue;
      if (val instanceof File && val.size > 0) uploadedImageKeys.add(key);
    }

    const missingRequiredImages = getRequiredImageKeys(imageStrategy, uniqueColors)
      .filter((key) => !uploadedImageKeys.has(key) && !persistedImages[key]);
    if (missingRequiredImages.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required images: ${missingRequiredImages.join(", ")}`,
      }, { status: 400 });
    }

    // 3. Validate store — stores.user_id is the owner column (no owner_id column exists)
    const { data: store } = await supabase
      .from("stores")
      .select("id, slug, name")
      .eq("id", wd.storeId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!store) {
      return NextResponse.json({ success: false, error: "Store not found or access denied" }, { status: 403 });
    }
    console.log("[Create] Store:", store.name);

    // 4. SKU uniqueness
    const { data: dup } = await supabase
      .from("products_internal").select("product_id").eq("base_sku", baseSku).limit(1);
    if (dup?.length) {
      return NextResponse.json({ success: false, error: `SKU ${baseSku} already exists` }, { status: 409 });
    }

    // 5. Totals
    const validVariants = normalizedVariants.map((variant) => ({
      ...variant,
      sku: buildVariantSku(baseSku, variant.color, variant.size),
    }));
    const totalQty = validVariants.reduce((s, v) => s + v.quantity, 0);
    const prices = validVariants.map(v => v.price);
    const basePrice = prices.length ? Math.min(...prices) : 0;
    const now = new Date().toISOString();

    // 6. Insert product — column names from R code's products_internal table
    productId = `PROD_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    const productRec = {
  product_id: productId,
  seller_id: store.id,
  product_name: productName,
  description,
  category,
  subcategory,
  material,
  gender: normalizeText(wd.gender) || null,
  age_group: normalizeText(wd.ageGroup) || null,
  base_sku: baseSku,
  price: basePrice,
  quantity: totalQty,
  status: "active",
  approval_status: "pending",
  image_strategy: imageStrategy,
  notes: buildMergedNotes(wd),
  mood_tags: Array.isArray(wd.moodTags) && wd.moodTags.length > 0 ? wd.moodTags : [],  // ← ADD THIS
  fiber_composition:          buildFiberComposition(wd),
  country_of_origin:          normalizeText(wd.countryOfOrigin)         || null,
  country_of_transformation:  normalizeText(wd.countryOfTransformation) || null,
  brand:                      normalizeText(wd.labelBrand) || normalizeText(wd.brand) || null,
  care_instructions:          JSON.stringify(buildCareInstructionsJson(wd)),
  care_instructions_json:     buildCareInstructionsJson(wd),
  children_safety_flags:      Array.isArray(wd.childrenSafetyFlags) && wd.childrenSafetyFlags.length > 0
                                ? wd.childrenSafetyFlags : null,
  flammability_class:         Array.isArray(wd.flammabilityFlags) && wd.flammabilityFlags.length > 0
                                ? wd.flammabilityFlags.join(",") : null,
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
    const ALLOWED_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp"]);
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

    const imageEntries = [];
    for (const [key, manifest] of Object.entries(persistedImages)) {
      imageEntries.push({ key, kind: "persisted", manifest });
    }
    for (const [key, val] of formData.entries()) {
      if (key === "wizard_data") continue;
      if (!(val instanceof File) || val.size === 0) continue;
      imageEntries.push({ key, kind: "file", file: val });
    }

    const categorySafe = (wd.category || "general").toLowerCase().replace(/\s/g, "_");

    // Upload all images in parallel
    const imageResults = await Promise.allSettled(
      imageEntries.map(async (entry, index) => {
        const { key } = entry;

        const ext = entry.kind === "file"
          ? entry.file.name.split(".").pop()?.toLowerCase() || "jpg"
          : entry.manifest.originalFilename?.split(".").pop()?.toLowerCase() || "jpg";
        if (!ALLOWED_IMAGE_EXTS.has(ext)) throw new Error(`${key}: unsupported file type .${ext}`);
        if (entry.kind === "file" && entry.file.size > MAX_IMAGE_BYTES) {
          throw new Error(`${key}: file exceeds 10 MB limit`);
        }

        const parts = key.split("_");
        let imgType = "front", imgStrategy = "general", varColor = null;
        if (key.startsWith("mixed_variant_")) {
          imgStrategy = "mixed_variant"; varColor = parts[2]; imgType = parts.slice(3).join("_");
        } else if (key.startsWith("mixed_general_")) {
          imgStrategy = "mixed_general"; imgType = parts.slice(2).join("_");
        } else if (key.startsWith("variant_")) {
          imgStrategy = "variant"; varColor = parts[1]; imgType = parts.slice(2).join("_");
        } else if (key.startsWith("general_")) {
          imgStrategy = "general"; imgType = parts.slice(1).join("_");
        }

        const imageId = `IMG_${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
        let storagePath;
        if (varColor) {
          const colorSafe = varColor.replace(/\s/g, "_");
          storagePath = `${store.id}/${categorySafe}/${productId}/variants/${colorSafe}/${imgType}_${imageId}.${ext}`;
        } else {
          storagePath = `${store.id}/${categorySafe}/${productId}/general/${imgType}_${imageId}.${ext}`;
        }

        if (entry.kind === "file") {
          const buffer = Buffer.from(await entry.file.arrayBuffer());
          const { error: upErr } = await supabase.storage
            .from("product-images")
            .upload(storagePath, buffer, { contentType: entry.file.type || "image/jpeg", upsert: true });
          if (upErr) throw new Error(`${key}: ${upErr.message}`);
        } else {
          const { error: copyErr } = await supabase.storage
            .from("product-images")
            .copy(entry.manifest.storagePath, storagePath);
          if (copyErr) throw new Error(`${key}: ${copyErr.message}`);
        }

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(storagePath);

        return {
          storagePath,
          record: {
            image_id: imageId,
            product_id: productId,
            image_path: storagePath,
            original_filename: entry.kind === "file" ? entry.file.name : entry.manifest.originalFilename,
            file_size: entry.kind === "file" ? entry.file.size : entry.manifest.sizeBytes,
            mime_type: entry.kind === "file" ? (entry.file.type || "image/jpeg") : (entry.manifest.mimeType || "image/jpeg"),
            image_type: imgType,
            image_strategy: imgStrategy,
            variant_color: varColor || null,
            image_order: index + 1,
            is_primary: index === 0,
            supabase_image_id: imageId,
            supabase_url: urlData?.publicUrl || null,
            supabase_storage_path: storagePath,
            supabase_upload_status: "uploaded",
            supabase_uploaded_at: now,
            is_active: true,
            uploaded_at: now,
          },
        };
      })
    );

    const imgErrors = imageResults
      .filter(r => r.status === "rejected")
      .map(r => r.reason?.message || String(r.reason));
    const imgSuccesses = imageResults
      .filter(r => r.status === "fulfilled")
      .map(r => r.value);

    uploadedStoragePaths = imgSuccesses.map(r => r.storagePath);

    if (imgErrors.length > 0) {
      await cleanupCreatedRecords(supabase, productId, uploadedStoragePaths);
      productId = null;
      return NextResponse.json({
        success: false,
        error: `Image upload failed: ${imgErrors.join("; ")}`,
      }, { status: 500 });
    }

    // Batch-insert all image records in one round-trip
    if (imgSuccesses.length > 0) {
      const { error: imgDbErr } = await supabase.from("product_images").insert(imgSuccesses.map(r => r.record));
      if (imgDbErr) {
        console.error("[Create] Image DB batch insert failed:", imgDbErr.message);
        await cleanupCreatedRecords(supabase, productId, uploadedStoragePaths);
        productId = null;
        return NextResponse.json({ success: false, error: `Image records: ${imgDbErr.message}` }, { status: 500 });
      }
    }
    console.log("[Create] Images:", imgSuccesses.length, "saved");

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
        sku: baseSku,
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
      scanned_sku: baseSku,
      expected_sku: baseSku,
      match_result: true,
      verified_by: user.id,
      verified_at: now,
    });
    if (verifyErr) console.warn("[Create] Verify log failed:", verifyErr.message);

    // 12. Insert into the marketplace `products` table so the product appears in the dashboard
    const publicImageUrls = imgSuccesses.map(r => r.record.supabase_url).filter(Boolean);

    // Generate a unique slug within this store
    let productSlug = String(productName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || baseSku.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const { data: slugRows } = await supabase
      .from("products")
      .select("slug")
      .eq("store_id", store.id)
      .ilike("slug", `${productSlug}%`)
      .limit(20);
    const usedSlugs = new Set((slugRows || []).map(r => r.slug));
    if (usedSlugs.has(productSlug)) {
      const suffixes = [...usedSlugs].map(s => { const m = s.match(/-(\d+)$/); return m ? parseInt(m[1], 10) : 0; });
      productSlug = `${productSlug}-${Math.max(0, ...suffixes) + 1}`;
    }

    const specsForMarketplace = normalizeSpecifications(wd.specifications).value;

    const marketplaceRecord = {
      store_id: store.id,
      name: productName,
      slug: productSlug,
      sku: baseSku,
      description,
      price: basePrice,
      discount_price: null,
      stock_quantity: totalQty,
      is_active: false,
      image_urls: publicImageUrls,
      video_urls: [],
      specifications: specsForMarketplace,
      moderation_status: "draft",
      submitted_at: null,
      reviewed_at: null,
      reviewed_by: null,
      rejection_reason: null,
      published_at: null,
    };

    const { data: marketplaceProduct, error: marketplaceErr } = await supabase
      .from("products")
      .insert(marketplaceRecord)
      .select("id")
      .single();

    if (marketplaceErr) {
      console.error("[Create] Marketplace insert failed:", marketplaceErr.message);
      await cleanupCreatedRecords(supabase, productId, uploadedStoragePaths);
      productId = null;
      return NextResponse.json({ success: false, error: `Failed to publish to marketplace: ${marketplaceErr.message}` }, { status: 500 });
    }
    console.log("[Create] Marketplace product:", marketplaceProduct.id);

    // 13. Insert mood tags
    if (Array.isArray(wd.moodTags) && wd.moodTags.length > 0) {
      const moodRecs = wd.moodTags.map(key => ({
        product_id: marketplaceProduct.id,
        mood_key: key,
        mood_fit_score: 0.7,
        is_active: true,
      }));
      const { error: moodErr } = await supabase.from("product_mood_tags").insert(moodRecs);
      if (moodErr) console.warn("[Create] Mood tags failed:", moodErr.message);
      else console.log("[Create] Mood tags:", wd.moodTags.length, "saved");
    }

    await cleanupDraftRecord(
      supabase,
      normalizeText(wd.draftId),
      store.id,
      user.id,
      persistedImages
    );

    console.log("[Create] ✅ DONE:", productId);

    return NextResponse.json({
      success: true,
      product: { id: productId, marketplace_id: marketplaceProduct.id, base_sku: baseSku, name: productName, status: "draft" },
      variants_created: varRecs.length,
      images_uploaded: imgSuccesses.length,
    });

  } catch (err) {
    console.error("[Create] ❌ ERROR:", err);
    if (productId) {
      try {
        const supabase = await createClient();
        await cleanupCreatedRecords(supabase, productId, uploadedStoragePaths);
      } catch {}
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
