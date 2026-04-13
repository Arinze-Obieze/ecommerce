import { NextResponse } from "next/server";
import { requireStoreApi, STORE_ROLES } from "@/utils/storeAuth";
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';

const DRAFT_TABLE = "product_creation_drafts";
const DRAFT_BUCKET = "product-images";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pickPersistableState(state = {}) {
  return {
    category: state.category || null,
    subcategory: state.subcategory || null,
    productName: normalizeText(state.productName),
    brand: normalizeText(state.brand),
    material: normalizeText(state.material),
    description: normalizeText(state.description),
    gender: normalizeText(state.gender),
    ageGroup: normalizeText(state.ageGroup),
    variants: Array.isArray(state.variants) ? state.variants : [],
    bulkDiscountTiers: Array.isArray(state.bulkDiscountTiers) ? state.bulkDiscountTiers : [],
    imageStrategy: normalizeText(state.imageStrategy) || "general",
    variantNotes: state.variantNotes && typeof state.variantNotes === "object" ? state.variantNotes : {},
    productNotes: normalizeText(state.productNotes),
    specificationSummary: normalizeText(state.specificationSummary),
    specifications: Array.isArray(state.specifications) ? state.specifications : [],
    baseSku: normalizeText(state.baseSku) || null,
    variantSkus: Array.isArray(state.variantSkus) ? state.variantSkus : [],
    printCompleted: Boolean(state.printCompleted),
    printType: normalizeText(state.printType) || "all",
    printCopies: Math.max(0, Number.parseInt(state.printCopies, 10) || 0),
    scannedSku: normalizeText(state.scannedSku),
    isVerified: Boolean(state.isVerified),
    fiberComposition: Array.isArray(state.fiberComposition) ? state.fiberComposition : [],
    countryOfOrigin: normalizeText(state.countryOfOrigin),
    countryOfTransformation: normalizeText(state.countryOfTransformation),
    labelBrand: normalizeText(state.labelBrand),
    careWashing: state.careWashing || null,
    careBleaching: state.careBleaching || null,
    careDrying: state.careDrying || null,
    careIroning: state.careIroning || null,
    careDryCleaning: state.careDryCleaning || null,
    childrenSafetyFlags: Array.isArray(state.childrenSafetyFlags) ? state.childrenSafetyFlags : [],
    flammabilityFlags: Array.isArray(state.flammabilityFlags) ? state.flammabilityFlags : [],
  };
}

function normalizeManifest(manifest = {}) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return {};

  return Object.fromEntries(
    Object.entries(manifest)
      .map(([key, value]) => {
        if (!key || !value || typeof value !== "object") return null;
        const publicUrl = normalizeText(value.publicUrl || value.public_url);
        const storagePath = normalizeText(value.storagePath || value.storage_path);
        if (!publicUrl || !storagePath) return null;

        return [key, {
          publicUrl,
          storagePath,
          originalFilename: normalizeText(value.originalFilename || value.original_filename) || null,
          mimeType: normalizeText(value.mimeType || value.mime_type) || null,
          sizeBytes: Math.max(0, Number.parseInt(value.sizeBytes || value.size_bytes, 10) || 0),
        }];
      })
      .filter(Boolean)
  );
}

function buildHydratedState(wizardState = {}, imageManifest = {}) {
  const manifest = normalizeManifest(imageManifest);
  return {
    ...pickPersistableState(wizardState),
    images: {},
    imagePreviews: Object.fromEntries(
      Object.entries(manifest).map(([key, value]) => [key, value.publicUrl])
    ),
    persistedImages: manifest,
  };
}

async function removeStoragePaths(adminClient, storagePaths) {
  const cleaned = [...new Set((storagePaths || []).filter(Boolean))];
  if (cleaned.length === 0) return;
  try {
    await adminClient.storage.from(DRAFT_BUCKET).remove(cleaned);
  } catch {}
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: "store_products_read",
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { data, error } = await ctx.adminClient
    .from(DRAFT_TABLE)
    .select("id, current_step, wizard_state, image_manifest, updated_at")
    .eq("store_id", ctx.membership.store_id)
    .eq("user_id", ctx.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ success: true, data: null, storage_ready: false });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ success: true, data: null, storage_ready: true });
  }

  return NextResponse.json({
    success: true,
    storage_ready: true,
    data: {
      id: data.id,
      currentStep: data.current_step || 1,
      updatedAt: data.updated_at,
      state: buildHydratedState(data.wizard_state || {}, data.image_manifest || {}),
    },
  });
}

export async function PUT(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: "store_products_write",
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const formData = await request.formData();
  const raw = formData.get("wizard_data");
  if (!raw) {
    return NextResponse.json({ error: "Missing wizard_data" }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid wizard_data payload" }, { status: 400 });
  }

  const currentStep = Math.min(5, Math.max(1, Number.parseInt(payload?.currentStep, 10) || 1));
  const wizardState = pickPersistableState(payload?.state || {});
  const desiredManifest = normalizeManifest(payload?.persistedImages || {});

  let draft = null;
  const requestedDraftId = normalizeText(payload?.draftId);
  if (requestedDraftId) {
    const { data } = await ctx.adminClient
      .from(DRAFT_TABLE)
      .select("id, image_manifest")
      .eq("id", requestedDraftId)
      .eq("store_id", ctx.membership.store_id)
      .eq("user_id", ctx.user.id)
      .eq("status", "active")
      .maybeSingle();
    draft = data;
  }

  if (!draft) {
    const { data, error } = await ctx.adminClient
      .from(DRAFT_TABLE)
      .upsert({
        store_id: ctx.membership.store_id,
        user_id: ctx.user.id,
        status: "active",
        current_step: currentStep,
        wizard_state: wizardState,
        image_manifest: desiredManifest,
      }, {
        onConflict: "store_id,user_id",
      })
      .select("id, image_manifest")
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ error: "Draft storage is not ready. Run the product_creation_drafts migration first." }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    draft = data;
  }

  const previousManifest = normalizeManifest(draft.image_manifest || {});
  const nextManifest = { ...desiredManifest };
  const replacedStoragePaths = [];

  for (const [key, value] of formData.entries()) {
    if (key === "wizard_data") continue;
    if (!(value instanceof File) || value.size === 0) continue;

    const ext = normalizeText(value.name.split(".").pop()).toLowerCase() || "jpg";
    const storagePath = `${ctx.membership.store_id}/drafts/${draft.id}/${key}_${Date.now()}.${ext}`;
    const buffer = Buffer.from(await value.arrayBuffer());

    const { error: uploadError } = await ctx.adminClient.storage
      .from(DRAFT_BUCKET)
      .upload(storagePath, buffer, {
        contentType: value.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const oldStoragePath = previousManifest[key]?.storagePath;
    if (oldStoragePath && oldStoragePath !== storagePath) {
      replacedStoragePaths.push(oldStoragePath);
    }

    const { data: urlData } = ctx.adminClient.storage.from(DRAFT_BUCKET).getPublicUrl(storagePath);
    nextManifest[key] = {
      publicUrl: urlData?.publicUrl || "",
      storagePath,
      originalFilename: value.name,
      mimeType: value.type || "image/jpeg",
      sizeBytes: value.size,
    };
  }

  const desiredKeys = new Set(Object.keys(nextManifest));
  const removedStoragePaths = Object.entries(previousManifest)
    .filter(([key]) => !desiredKeys.has(key))
    .map(([, value]) => value.storagePath)
    .filter(Boolean);

  const { data: savedDraft, error: saveError } = await ctx.adminClient
    .from(DRAFT_TABLE)
    .update({
      current_step: currentStep,
      wizard_state: wizardState,
      image_manifest: nextManifest,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id)
    .eq("store_id", ctx.membership.store_id)
    .eq("user_id", ctx.user.id)
    .select("id, current_step, wizard_state, image_manifest, updated_at")
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  await removeStoragePaths(ctx.adminClient, [...replacedStoragePaths, ...removedStoragePaths]);

  return NextResponse.json({
    success: true,
    data: {
      id: savedDraft.id,
      currentStep: savedDraft.current_step || 1,
      updatedAt: savedDraft.updated_at,
      state: buildHydratedState(savedDraft.wizard_state || {}, savedDraft.image_manifest || {}),
    },
  });
}

export async function DELETE(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: "store_products_write",
    identifier: ctx.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const { data, error } = await ctx.adminClient
    .from(DRAFT_TABLE)
    .delete()
    .eq("store_id", ctx.membership.store_id)
    .eq("user_id", ctx.user.id)
    .eq("status", "active")
    .select("image_manifest")
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const manifest = normalizeManifest(data?.image_manifest || {});
  await removeStoragePaths(ctx.adminClient, Object.values(manifest).map((value) => value.storagePath));

  return NextResponse.json({ success: true });
}
