const DRAFT_TABLE = "product_creation_drafts";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
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

        return [
          key,
          {
            publicUrl,
            storagePath,
            originalFilename: normalizeText(value.originalFilename || value.original_filename) || null,
            mimeType: normalizeText(value.mimeType || value.mime_type) || null,
            sizeBytes: Math.max(0, Number.parseInt(value.sizeBytes || value.size_bytes, 10) || 0),
          },
        ];
      })
      .filter(Boolean)
  );
}

function buildHydratedState(wizardState = {}, imageManifest = {}) {
  const persistedImages = normalizeManifest(imageManifest);

  return {
    ...wizardState,
    images: {},
    imagePreviews: Object.fromEntries(
      Object.entries(persistedImages).map(([key, value]) => [key, value.publicUrl])
    ),
    persistedImages,
  };
}

export async function getWizardDraftBootstrap({ adminClient, storeId, userId }) {
  try {
    const { data, error } = await adminClient
      .from(DRAFT_TABLE)
      .select("id, current_step, wizard_state, image_manifest, updated_at")
      .eq("store_id", storeId)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      if (error.code === "42P01") {
        return {
          draft: null,
          storageReady: false,
          status: "missing_storage",
        };
      }

      return {
        draft: null,
        storageReady: true,
        status: "error",
      };
    }

    if (!data) {
      return {
        draft: null,
        storageReady: true,
        status: "ok",
      };
    }

    return {
      storageReady: true,
      status: "ok",
      draft: {
        id: data.id,
        currentStep: Math.min(5, Math.max(1, Number.parseInt(data.current_step, 10) || 1)),
        updatedAt: data.updated_at,
        state: buildHydratedState(data.wizard_state || {}, data.image_manifest || {}),
      },
    };
  } catch {
    return {
      draft: null,
      storageReady: true,
      status: "error",
    };
  }
}
