// components/product-wizard/WizardProvider.jsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { WIZARD_STEPS, INITIAL_WIZARD_STATE } from "@/lib/product-wizard-constants";
import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef, useState } from "react";

const WizardContext = createContext(null);

function wizardReducer(state, action) {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, category: action.payload, subcategory: null };
    case "SET_SUBCATEGORY":
      return { ...state, subcategory: action.payload };
    case "SET_BASIC_INFO":
      return { ...state, ...action.payload };
    case "SET_VARIANTS":
      return { ...state, variants: action.payload };
    case "ADD_VARIANT":
      return { ...state, variants: [...state.variants, action.payload] };
    case "REMOVE_VARIANT":
      return { ...state, variants: state.variants.filter((_, i) => i !== action.payload) };
    case "UPDATE_VARIANT":
      return {
        ...state,
        variants: state.variants.map((v, i) =>
          i === action.index ? { ...v, ...action.payload } : v
        ),
      };
    case "SET_IMAGE_STRATEGY":
      return { ...state, imageStrategy: action.payload };
    case "SET_IMAGE": {
      return {
        ...state,
        images: { ...state.images, [action.key]: action.file },
        imagePreviews: { ...state.imagePreviews, [action.key]: action.preview },
        persistedImages: action.persisted
          ? { ...state.persistedImages, [action.key]: action.persisted }
          : state.persistedImages,
      };
    }
    case "REMOVE_IMAGE": {
      const imgs = { ...state.images };
      const prvs = { ...state.imagePreviews };
      const persisted = { ...state.persistedImages };
      delete imgs[action.key];
      delete prvs[action.key];
      delete persisted[action.key];
      return { ...state, images: imgs, imagePreviews: prvs, persistedImages: persisted };
    }
    case "SET_VARIANT_NOTE":
      return { ...state, variantNotes: { ...state.variantNotes, [action.color]: action.note } };
    case "SET_PRODUCT_NOTES":
      return { ...state, productNotes: action.payload };
    case "SET_SKU":
      return { ...state, baseSku: action.baseSku, variantSkus: action.variantSkus };
    case "SET_PRINT_STATUS":
      return { ...state, ...action.payload };
    case "SET_SCANNED_SKU":
      return { ...state, scannedSku: action.payload };
    case "SET_VERIFIED":
      return { ...state, isVerified: true };
    case "SET_LABEL_INFO":
      return { ...state, ...action.payload };
    case "HYDRATE":
      return { ...INITIAL_WIZARD_STATE, ...action.payload };
    case "SYNC_DRAFT_IMAGES":
      return {
        ...state,
        images: {},
        persistedImages: action.payload,
        imagePreviews: Object.fromEntries(
          Object.entries(action.payload || {}).map(([key, value]) => [key, value.publicUrl])
        ),
      };
    case "RESET":
      return { ...INITIAL_WIZARD_STATE };
    default:
      return state;
  }
}

export function WizardProvider({ children, storeData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE);
  const [draftId, setDraftId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("idle");
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(null);
  const [draftStorageReady, setDraftStorageReady] = useState(true);
  const [pendingDraft, setPendingDraft] = useState(null);
  const hydratedRef = useRef(false);
  const suppressAutosaveRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const hasLocalChangesRef = useRef(false);

  const storeContext = useMemo(
    () => storeData
      ? { id: storeData.id, slug: storeData.slug || storeData.name, name: storeData.name }
      : null,
    [storeData]
  );

  const loading = false;

  const currentStep = (() => {
    const match = pathname?.match(/step-(\d+)/);
    return match ? parseInt(match[1]) : 1;
  })();

  const basePath = (() => {
    if (!pathname) return "/store/dashboard/products/new";
    const idx = pathname.indexOf("/products/new");
    if (idx !== -1) return pathname.slice(0, idx) + "/products/new";
    return "/store/dashboard/products/new";
  })();

  const productsPath = (() => {
    if (!pathname) return "/store/dashboard/products";
    const idx = pathname.indexOf("/products/new");
    if (idx !== -1) return pathname.slice(0, idx) + "/products";
    return "/store/dashboard/products";
  })();

  const goToStep = useCallback((n) => {
    const step = WIZARD_STEPS.find(s => s.num === n);
    if (step) router.push(`${basePath}/${step.slug}`);
  }, [router, basePath]);

  const goNext = useCallback(() => {
    if (currentStep < 8) goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const exitWizard = useCallback(() => {
    void fetch("/api/store/products/draft", { method: "DELETE" }).catch(() => {});
    dispatch({ type: "RESET" });
    setDraftId(null);
    setDraftUpdatedAt(null);
    setDraftStatus("idle");
    router.push(productsPath);
  }, [router, productsPath]);

  const resetWizard = useCallback(() => {
    void fetch("/api/store/products/draft", { method: "DELETE" }).catch(() => {});
    dispatch({ type: "RESET" });
    setDraftId(null);
    setDraftUpdatedAt(null);
    setDraftStatus("idle");
    goToStep(1);
  }, [goToStep]);

  const clearDraft = useCallback(async () => {
    try {
      await fetch("/api/store/products/draft", { method: "DELETE" });
    } catch {}
    setDraftId(null);
    setDraftUpdatedAt(null);
    setDraftStatus("idle");
    setPendingDraft(null);
  }, []);

  const applyDraft = useCallback((draft) => {
    if (!draft?.state) return;
    suppressAutosaveRef.current = true;
    dispatch({ type: "HYDRATE", payload: draft.state });
    setDraftId(draft.id || null);
    setDraftUpdatedAt(draft.updatedAt || null);
    setPendingDraft(null);
    hasLocalChangesRef.current = false;
    const resumeStep = Math.min(7, Math.max(1, Number.parseInt(draft.currentStep, 10) || 1));
    if (resumeStep !== currentStep) {
      goToStep(resumeStep);
    }
  }, [currentStep, goToStep]);

  const discardPendingDraft = useCallback(async () => {
    await clearDraft();
    suppressAutosaveRef.current = true;
    dispatch({ type: "RESET" });
    setPendingDraft(null);
    hasLocalChangesRef.current = false;
    if (currentStep !== 1) {
      goToStep(1);
    }
  }, [clearDraft, currentStep, goToStep]);

  useEffect(() => {
    if (!storeContext?.id || hydratedRef.current) return;

    let cancelled = false;
    setDraftStatus("loading");

    (async () => {
      try {
        const res = await fetch("/api/store/products/draft", { cache: "no-store" });
        const result = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          hydratedRef.current = true;
          setDraftStatus("error");
          return;
        }

        setDraftStorageReady(result.storage_ready !== false);

        if (result?.data?.state) {
          setPendingDraft(result.data);
        }

        hydratedRef.current = true;
        hasLocalChangesRef.current = false;
        setDraftStatus("idle");
      } catch {
        if (!cancelled) {
          hydratedRef.current = true;
          setDraftStatus("error");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [storeContext]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (suppressAutosaveRef.current) {
      suppressAutosaveRef.current = false;
      hasLocalChangesRef.current = false;
      return;
    }
    hasLocalChangesRef.current = true;
  }, [state, currentStep]);

  useEffect(() => {
    if (!hydratedRef.current || !draftStorageReady || !hasLocalChangesRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setDraftStatus("saving");
      try {
        const fd = new FormData();
        fd.append("wizard_data", JSON.stringify({
          draftId,
          currentStep,
          state,
          persistedImages: state.persistedImages,
        }));

        Object.entries(state.images).forEach(([key, file]) => {
          if (file instanceof File) fd.append(key, file);
        });

        const res = await fetch("/api/store/products/draft", { method: "PUT", body: fd });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save draft");

        setDraftId(result?.data?.id || null);
        setDraftUpdatedAt(result?.data?.updatedAt || null);
        if (result?.data?.state?.persistedImages) {
          suppressAutosaveRef.current = true;
          dispatch({ type: "SYNC_DRAFT_IMAGES", payload: result.data.state.persistedImages });
        }
        hasLocalChangesRef.current = false;
        setDraftStatus("saved");
      } catch {
        setDraftStatus("error");
      }
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [currentStep, draftId, draftStorageReady, state]);

  return (
    <WizardContext.Provider value={{
      state, dispatch, storeContext, loading,
      currentStep, goToStep, goNext, goBack,
      exitWizard, resetWizard, productsPath,
      draftId, draftStatus, draftUpdatedAt, draftStorageReady, clearDraft,
      pendingDraft, applyDraft, discardPendingDraft,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}