import { FiCheck } from "react-icons/fi";

export const PRODUCT_EDITOR_STEPS = [
  { id: 1, label: "Basic Info", description: "Product name, description, pricing" },
  { id: 2, label: "Media", description: "Images and videos" },
  { id: 3, label: "Details", description: "Specifications and pricing tiers" },
  { id: 4, label: "Review", description: "Summary and actions" },
];

export function createEmptySpecification() {
  return { key: "", value: "" };
}

export function createEmptyBulkTier() {
  return { minimum_quantity: "", discount_percent: "" };
}

export function inferMediaType(file) {
  if (file?.type?.startsWith("image/")) return "image";
  if (file?.type?.startsWith("video/")) return "video";
  return "";
}

export function createInitialForm(product) {
  return {
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price ?? "",
    discount_price: product?.discount_price ?? "",
    stock_quantity: product?.stock_quantity ?? 0,
    specifications:
      Array.isArray(product?.specifications) && product.specifications.length > 0
        ? product.specifications.map((entry) => ({
            key: String(entry?.key || ""),
            value: String(entry?.value || ""),
          }))
        : [createEmptySpecification()],
    bulk_discount_tiers:
      Array.isArray(product?.bulk_discount_tiers) && product.bulk_discount_tiers.length > 0
        ? product.bulk_discount_tiers.map((tier) => ({
            minimum_quantity: String(tier?.minimum_quantity ?? ""),
            discount_percent: String(tier?.discount_percent ?? ""),
          }))
        : [createEmptyBulkTier()],
  };
}

export function createMediaFromProduct(product) {
  const images = Array.isArray(product?.image_urls)
    ? product.image_urls.map((url, index) => ({
        id: `image-${index}-${url}`,
        type: "image",
        public_url: url,
      }))
    : [];

  const videos = Array.isArray(product?.video_urls)
    ? product.video_urls.map((url, index) => ({
        id: `video-${index}-${url}`,
        type: "video",
        public_url: url,
      }))
    : [];

  return [...images, ...videos];
}

export function buildVariantLabel(variant) {
  const color = String(variant?.color || "").trim();
  const size = String(variant?.size || "").trim();

  if (color && size) return `${color} / ${size}`;
  return color || size || "Unnamed variant";
}

export function getStatusMeta(status) {
  switch (status) {
    case "approved":
      return {
        tone: "green",
        title: "Live and approved",
        message: "Any seller edit will send this product back into review before it goes live again.",
      };
    case "pending_review":
      return {
        tone: "amber",
        title: "Under review",
        message: "Admins are reviewing the latest submission. You can still update details if needed.",
      };
    case "rejected":
      return {
        tone: "red",
        title: "Needs changes",
        message: "Update the product and resubmit once the rejection feedback has been addressed.",
      };
    case "archived":
      return {
        tone: "slate",
        title: "Archived",
        message: "This product is hidden from buyers. Unarchive it when you want to work on it again.",
      };
    default:
      return {
        tone: "blue",
        title: "Draft",
        message: "This product is still private. Save edits freely, then submit when it is ready for review.",
      };
  }
}

export function normalizeQuickSellQuantity(value) {
  const parsedQuantity = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
}

export function resolveQuickSellState({
  product,
  selectedScanVariantId,
  sellQuantityInput,
  quickSelling,
}) {
  const scanVariants = Array.isArray(product?.variants) ? product.variants : [];
  const hasScanVariants = scanVariants.length > 0;
  const selectedScanVariant = hasScanVariants
    ? scanVariants.find((variant) => String(variant.id) === String(selectedScanVariantId))
    : null;
  const selectedScanVariantStock =
    Number.parseInt(selectedScanVariant?.stock_quantity, 10) || 0;
  const effectiveScanStock = hasScanVariants
    ? selectedScanVariantStock
    : (Number.parseInt(product?.stock_quantity, 10) || 0);
  const activeSellQuantity = normalizeQuickSellQuantity(sellQuantityInput);
  const quickSellDisabled = hasScanVariants
    ? quickSelling || !selectedScanVariant?.id || selectedScanVariantStock < activeSellQuantity
    : quickSelling || (Number.parseInt(product?.stock_quantity, 10) || 0) < activeSellQuantity;

  return {
    scanVariants,
    hasScanVariants,
    selectedScanVariant,
    selectedScanVariantStock,
    effectiveScanStock,
    activeSellQuantity,
    quickSellDisabled,
  };
}

export function getEditorMode(searchMode) {
  return String(searchMode || '').trim().toLowerCase() === 'scan' ? 'scan' : 'editor';
}

export function getEditorStep(stepValue, mode) {
  const fallbackStep = mode === 'scan' ? 4 : 1;
  return Math.max(
    1,
    Math.min(4, Number.parseInt(String(stepValue || fallbackStep), 10) || 1)
  );
}

export function getToneClasses(tone) {
  switch (tone) {
    case "green":
      return "border-green-200 bg-green-50 text-green-900";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "red":
      return "border-red-200 bg-red-50 text-red-900";
    case "slate":
      return "border-slate-200 bg-slate-50 text-slate-900";
    default:
      return "border-blue-200 bg-blue-50 text-blue-900";
  }
}

export function ProductEditorStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {PRODUCT_EDITOR_STEPS.map((step, index) => (
        <div key={step.id} className="flex min-w-max items-center gap-2">
          <div
            className={`zova-store-step-dot ${
              step.id < currentStep
                ? "is-complete"
                : step.id === currentStep
                  ? "is-active"
                  : ""
            }`}
          >
            {step.id < currentStep ? <FiCheck size={16} /> : step.id}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-[var(--zova-text-strong)]">{step.label}</p>
            <p className="text-[10px] text-[var(--zova-text-muted)]">{step.description}</p>
          </div>
          {index < PRODUCT_EDITOR_STEPS.length - 1 ? (
            <div
              className={`h-0.5 w-3 ${
                step.id < currentStep ? "bg-[var(--zova-primary-action)]" : "bg-[var(--zova-border)]"
              }`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
