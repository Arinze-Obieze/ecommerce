// components/product-wizard/WizardProvider.jsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { WIZARD_STEPS, INITIAL_WIZARD_STATE } from "@/lib/product-wizard-constants";
import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";

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
      };
    }
    case "REMOVE_IMAGE": {
      const imgs = { ...state.images };
      const prvs = { ...state.imagePreviews };
      delete imgs[action.key];
      delete prvs[action.key];
      return { ...state, images: imgs, imagePreviews: prvs };
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

  // storeData comes from the server layout via requireStorePage()
  // It's the same store object your StoreShell uses
// Add useMemo to imports


// Replace the inline storeContext object with:
const storeContext = useMemo(
  () => storeData
    ? { id: storeData.id, slug: storeData.slug || storeData.name, name: storeData.name }
    : null,
  [storeData]
);

  const loading = false; // store is already loaded server-side, no async wait

  // Current step from URL
  const currentStep = (() => {
    const match = pathname?.match(/step-(\d)/);
    return match ? parseInt(match[1]) : 1;
  })();

  // Build the base path for wizard routes
  // Handles both /store/dashboard/products/new and /store/[id]/dashboard/products/new
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
    if (currentStep < 7) goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const exitWizard = useCallback(() => {
    dispatch({ type: "RESET" });
    router.push(productsPath);
  }, [router, productsPath]);

  const resetWizard = useCallback(() => {
    dispatch({ type: "RESET" });
    goToStep(1);
  }, [goToStep]);

  return (
    <WizardContext.Provider value={{
      state, dispatch, storeContext, loading,
      currentStep, goToStep, goNext, goBack,
      exitWizard, resetWizard, productsPath,
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
