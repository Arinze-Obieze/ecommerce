'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import ProductReviewsManager from '@/components/Store/ProductReviewsManager';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const STEPS = [
  { id: 1, label: 'Basic Info', description: 'Product name, description, pricing' },
  { id: 2, label: 'Media', description: 'Images and videos' },
  { id: 3, label: 'Details', description: 'Specifications and pricing tiers' },
  { id: 4, label: 'Review', description: 'Summary and actions' },
];

function createEmptySpecification() {
  return { key: '', value: '' };
}

function createEmptyBulkTier() {
  return { minimum_quantity: '', discount_percent: '' };
}

function inferMediaType(file) {
  if (file?.type?.startsWith('image/')) return 'image';
  if (file?.type?.startsWith('video/')) return 'video';
  return '';
}

function createInitialForm(product) {
  return {
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price ?? '',
    discount_price: product?.discount_price ?? '',
    stock_quantity: product?.stock_quantity ?? 0,
    specifications: Array.isArray(product?.specifications) && product.specifications.length > 0
      ? product.specifications.map((entry) => ({
        key: String(entry?.key || ''),
        value: String(entry?.value || ''),
      }))
      : [createEmptySpecification()],
    bulk_discount_tiers: Array.isArray(product?.bulk_discount_tiers) && product.bulk_discount_tiers.length > 0
      ? product.bulk_discount_tiers.map((tier) => ({
        minimum_quantity: String(tier?.minimum_quantity ?? ''),
        discount_percent: String(tier?.discount_percent ?? ''),
      }))
      : [createEmptyBulkTier()],
  };
}

function createMediaFromProduct(product) {
  const images = Array.isArray(product?.image_urls)
    ? product.image_urls.map((url, index) => ({
      id: `image-${index}-${url}`,
      type: 'image',
      public_url: url,
    }))
    : [];

  const videos = Array.isArray(product?.video_urls)
    ? product.video_urls.map((url, index) => ({
      id: `video-${index}-${url}`,
      type: 'video',
      public_url: url,
    }))
    : [];

  return [...images, ...videos];
}

function buildVariantLabel(variant) {
  const color = String(variant?.color || '').trim();
  const size = String(variant?.size || '').trim();
  if (color && size) return `${color} / ${size}`;
  return color || size || 'Unnamed variant';
}

function getStatusMeta(status) {
  switch (status) {
    case 'approved':
      return {
        tone: 'green',
        title: 'Live and approved',
        message: 'Any seller edit will send this product back into review before it goes live again.',
      };
    case 'pending_review':
      return {
        tone: 'amber',
        title: 'Under review',
        message: 'Admins are reviewing the latest submission. You can still update details if needed.',
      };
    case 'rejected':
      return {
        tone: 'red',
        title: 'Needs changes',
        message: 'Update the product and resubmit once the rejection feedback has been addressed.',
      };
    case 'archived':
      return {
        tone: 'slate',
        title: 'Archived',
        message: 'This product is hidden from buyers. Unarchive it when you want to work on it again.',
      };
    default:
      return {
        tone: 'blue',
        title: 'Draft',
        message: 'This product is still private. Save edits freely, then submit when it is ready for review.',
      };
  }
}

function toneClasses(tone) {
  switch (tone) {
    case 'green':
      return 'border-green-200 bg-green-50 text-green-900';
    case 'amber':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'red':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'slate':
      return 'border-slate-200 bg-slate-50 text-slate-900';
    default:
      return 'border-blue-200 bg-blue-50 text-blue-900';
  }
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2 min-w-max">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step.id < currentStep
                ? 'bg-[#2E5C45] text-white'
                : step.id === currentStep
                ? 'border-2 border-[#2E5C45] bg-white text-[#2E5C45]'
                : 'border-2 border-gray-200 bg-white text-gray-400'
            }`}
          >
            {step.id < currentStep ? <FiCheck size={16} /> : step.id}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-900">{step.label}</p>
            <p className="text-[10px] text-gray-500">{step.description}</p>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`h-0.5 w-3 ${step.id < currentStep ? 'bg-[#2E5C45]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function StoreProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const mode = String(searchParams?.get('mode') || '').trim().toLowerCase();
  const isScanMode = mode === 'scan';
  const currentStep = Math.max(
    1,
    Math.min(4, Number.parseInt(searchParams?.get('step') || (isScanMode ? '4' : '1'), 10) || 1)
  );

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(createInitialForm(null));
  const [media, setMedia] = useState([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quickSelling, setQuickSelling] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellQuantityInput, setSellQuantityInput] = useState('1');
  const [selectedScanVariantId, setSelectedScanVariantId] = useState('');
  const [acting, setActing] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const statusMeta = useMemo(
    () => getStatusMeta(product?.moderation_status),
    [product?.moderation_status]
  );

  const syncProduct = (nextProduct) => {
    setProduct(nextProduct);
    setForm(createInitialForm(nextProduct));
    const nextMedia = createMediaFromProduct(nextProduct);
    setMedia(nextMedia);
    const firstImage = nextMedia.find((item) => item.type === 'image');
    setPrimaryImageUrl(nextProduct?.image_urls?.[0] || firstImage?.public_url || '');
      const nextVariants = Array.isArray(nextProduct?.variants) ? nextProduct.variants : [];
    if (nextVariants.length > 0) {
      const firstInStock = nextVariants.find((variant) => (Number.parseInt(variant?.stock_quantity, 10) || 0) > 0);
      setSelectedScanVariantId(String(firstInStock?.id || nextVariants[0]?.id || ''));
    } else {
      setSelectedScanVariantId('');
    }
  };

  useEffect(() => {
    setSellQuantityInput(String(sellQuantity));
  }, [sellQuantity]);

  const loadProduct = async ({ preserveNotice = true } = {}) => {
    try {
      setLoading(true);
      setError('');
      if (!preserveNotice) setNotice('');
      const res = await fetch(`/api/store/products/${productId}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load product');
      syncProduct(json.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    void loadProduct({ preserveNotice: false });
  }, [productId]);

  const updateSpecification = (index, field, value) => {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.map((spec, specIndex) => (
        specIndex === index ? { ...spec, [field]: value } : spec
      )),
    }));
  };

  const updateBulkDiscountTier = (index, field, value) => {
    setForm((current) => ({
      ...current,
      bulk_discount_tiers: current.bulk_discount_tiers.map((tier, tierIndex) => (
        tierIndex === index ? { ...tier, [field]: value } : tier
      )),
    }));
  };

  const removeMedia = (id) => {
    setMedia((current) => {
      const next = current.filter((item) => item.id !== id);
      if (!next.some((item) => item.public_url === primaryImageUrl)) {
        const nextPrimary = next.find((item) => item.type === 'image');
        setPrimaryImageUrl(nextPrimary?.public_url || '');
      }
      return next;
    });
  };

  const onFilesSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      setNotice('');

      const supabase = createSupabaseClient();
      const uploaded = [];

      for (const file of files) {
        const mediaType = inferMediaType(file);
        if (!mediaType) {
          throw new Error(`Unsupported file type for ${file.name}`);
        }

        const signRes = await fetch('/api/store/products/media/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mime_type: file.type,
            byte_size: file.size,
          }),
        });
        const signJson = await signRes.json();
        if (!signRes.ok) {
          throw new Error(signJson.error || `Failed to sign upload for ${file.name}`);
        }

        const signed = signJson.data;
        const { error: uploadError } = await supabase.storage
          .from(signed.bucket)
          .uploadToSignedUrl(signed.path, signed.token, file);

        if (uploadError) {
          throw new Error(uploadError.message || `Upload failed for ${file.name}`);
        }

        uploaded.push({
          id: `${signed.path}:${Date.now()}`,
          type: mediaType,
          public_url: signed.public_url,
        });
      }

      setMedia((current) => {
        const next = [...current, ...uploaded];
        if (!primaryImageUrl) {
          const firstImage = next.find((item) => item.type === 'image');
          if (firstImage) setPrimaryImageUrl(firstImage.public_url);
        }
        return next;
      });
      setNotice('Media uploaded. Continue to the next step.');
      event.target.value = '';
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = (submitForReview) => {
    const images = media.filter((item) => item.type === 'image');
    const videos = media.filter((item) => item.type === 'video');

    if (images.length < 1) {
      throw new Error('At least one image is required.');
    }

    const selectedPrimary = primaryImageUrl || images[0]?.public_url;
    if (!images.some((item) => item.public_url === selectedPrimary)) {
      throw new Error('Primary image must be selected from uploaded images.');
    }

    const hasIncompleteSpecification = form.specifications.some((spec) => {
      const key = String(spec?.key || '').trim();
      const value = String(spec?.value || '').trim();
      return (key && !value) || (!key && value);
    });
    if (hasIncompleteSpecification) {
      throw new Error('Each specification must include both a name and a value.');
    }

    const hasIncompleteBulkTier = form.bulk_discount_tiers.some((tier) => {
      const minimumQuantity = String(tier?.minimum_quantity || '').trim();
      const discountPercent = String(tier?.discount_percent || '').trim();
      return (minimumQuantity && !discountPercent) || (!minimumQuantity && discountPercent);
    });
    if (hasIncompleteBulkTier) {
      throw new Error('Each bulk discount tier must include both minimum quantity and discount percent.');
    }

    return {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: form.price,
      discount_price: form.discount_price,
      stock_quantity: form.stock_quantity,
      image_urls: images.map((item) => item.public_url),
      video_urls: videos.map((item) => item.public_url),
      primary_image_url: selectedPrimary,
      specifications: form.specifications
        .map((spec) => ({
          key: String(spec?.key || '').trim(),
          value: String(spec?.value || '').trim(),
        }))
        .filter((spec) => spec.key && spec.value),
      bulk_discount_tiers: form.bulk_discount_tiers
        .map((tier) => ({
          minimum_quantity: String(tier?.minimum_quantity || '').trim(),
          discount_percent: String(tier?.discount_percent || '').trim(),
        }))
        .filter((tier) => tier.minimum_quantity && tier.discount_percent),
      submit_for_review: submitForReview,
    };
  };

  const saveProduct = async (submitForReview = false) => {
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const payload = buildPayload(submitForReview);
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update product');

      await loadProduct();
      if (submitForReview) {
        setNotice('Product submitted for review.');
      } else if (product?.moderation_status === 'approved') {
        setNotice('Changes saved and resubmitted for review.');
      } else {
        setNotice('Product updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (step) => {
    router.push(`?step=${step}`, { scroll: false });
  };

  const printProductLabel = () => {
    if (!product?.sku) {
      setError('A product SKU is required.');
      return;
    }
    const label = product.name || 'Product';
    const w = window.open('', '_blank', 'width=820,height=620');
    if (!w) return;
    w.document.write(`<html><head><title>Print Labels</title><style>body{font-family:monospace;margin:0;padding:16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.l{border:1px solid #ccc;padding:14px;text-align:center}.l h4{margin:0 0 6px;font-size:10px;color:#666}.l .s{font-size:13px;font-weight:bold;letter-spacing:1.5px}.b{display:flex;justify-content:center;gap:1px;margin:6px 0;height:45px;align-items:flex-end}.br{background:#000;border-radius:.5px}</style></head><body><div class="g"><div class="l"><h4>${label}</h4><div class="b">${product.sku.split("").map((ch) => `<div class="br" style="width:${ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 2}px;height:${55 + (ch.charCodeAt(0) % 40)}%"></div>`).join("")}</div><div class="s">${product.sku}</div></div></div><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    setNotice('Print view opened.');
  };

  const duplicateProduct = async () => {
    try {
      setActing('duplicate');
      setError('');
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      router.push(`/store/dashboard/products/${json.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to duplicate');
    } finally {
      setActing('');
    }
  };

  const toggleArchive = async (archive) => {
    try {
      setActing(archive ? 'archive' : 'unarchive');
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      });
      if (!res.ok) throw new Error('Failed');
      await loadProduct();
      setNotice(archive ? 'Archived.' : 'Unarchived.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActing('');
    }
  };

  const sellOneViaScan = async () => {
    if (!product?.id) return;
    const parsedQty = Number.parseInt(String(sellQuantityInput || '').trim(), 10);
    const normalizedQty = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    if (normalizedQty !== sellQuantity) {
      setSellQuantity(normalizedQty);
    }
    const productVariants = Array.isArray(product?.variants) ? product.variants : [];
    const hasVariants = productVariants.length > 0;
    const selectedVariant = hasVariants
      ? productVariants.find((variant) => String(variant.id) === String(selectedScanVariantId))
      : null;

    try {
      setQuickSelling(true);
      setError('');
      setNotice('');

      let res;
      if (hasVariants) {
        if (!selectedVariant?.id) {
          throw new Error('Select a variant before selling.');
        }
        if ((Number.parseInt(selectedVariant?.stock_quantity, 10) || 0) < normalizedQty) {
          throw new Error(`Selected variant has less than ${normalizedQty} in stock.`);
        }

        res = await fetch('/api/store/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'adjust_variant',
            variantId: String(selectedVariant.id),
            mode: 'subtract',
            quantity: normalizedQty,
            reason: 'count',
            note: 'POS quick sale via QR scan',
          }),
        });
      } else {
        if ((Number.parseInt(product.stock_quantity, 10) || 0) < normalizedQty) {
          throw new Error(`Stock is less than ${normalizedQty}.`);
        }

        res = await fetch('/api/store/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'adjust_product',
            productId: Number.parseInt(product.id, 10),
            mode: 'subtract',
            quantity: normalizedQty,
            reason: 'count',
            note: 'POS quick sale via QR scan',
          }),
        });
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to reduce inventory');

      await loadProduct({ preserveNotice: false });
      if (hasVariants && selectedVariant) {
        setNotice(`Sold ${normalizedQty} unit(s) (${buildVariantLabel(selectedVariant)}). Inventory updated.`);
      } else {
        setNotice(`Sold ${normalizedQty} unit(s). Inventory updated.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to reduce inventory');
    } finally {
      setQuickSelling(false);
    }
  };

  const deleteProduct = async () => {
    try {
      setActing('delete');
      const res = await fetch(`/api/store/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      router.push('/store/dashboard/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setActing('');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        Product not found.
      </div>
    );
  }

  const images = media.filter((item) => item.type === 'image');
  const publicProductHref = product.slug ? `/products/${product.slug}` : '';
  const displayPrice = product.discount_price ?? product.price;
  const scanVariants = Array.isArray(product?.variants) ? product.variants : [];
  const hasScanVariants = scanVariants.length > 0;
  const selectedScanVariant = hasScanVariants
    ? scanVariants.find((variant) => String(variant.id) === String(selectedScanVariantId))
    : null;
  const selectedScanVariantStock = Number.parseInt(selectedScanVariant?.stock_quantity, 10) || 0;
  const effectiveScanStock = hasScanVariants
    ? selectedScanVariantStock
    : (Number.parseInt(product.stock_quantity, 10) || 0);
  const parsedInputQty = Number.parseInt(String(sellQuantityInput || '').trim(), 10);
  const activeSellQuantity = Number.isFinite(parsedInputQty) && parsedInputQty > 0 ? parsedInputQty : 1;
  const quickSellDisabled = hasScanVariants
    ? quickSelling || !selectedScanVariant?.id || selectedScanVariantStock < activeSellQuantity
    : quickSelling || (Number.parseInt(product.stock_quantity, 10) || 0) < activeSellQuantity;
  const primaryProductImageUrl = product?.image_urls?.[0] || '';

  if (isScanMode) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#cfe1d7] bg-[#f6faf7] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E5C45]">Scan Mode</p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-xs text-gray-500">Keep checkout fast. Scan, confirm quantity, sell.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl border border-[#dbe7e0] bg-white">
              {primaryProductImageUrl ? (
                <img src={primaryProductImageUrl} alt={product.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-xs font-semibold text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Price</p>
                  <p className="mt-1 text-base font-bold text-gray-900">₦{Number(displayPrice || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Stock</p>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    {effectiveScanStock} - {activeSellQuantity}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    After sell: {Math.max(0, effectiveScanStock - activeSellQuantity)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">SKU</p>
                  <p className="mt-1 truncate text-base font-bold text-gray-900">{product.sku || 'N/A'}</p>
                </div>
              </div>

              {hasScanVariants && (
                <div className="rounded-xl border border-[#dbe7e0] bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Variant</p>
                  <select
                    value={selectedScanVariantId}
                    onChange={(event) => setSelectedScanVariantId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                  >
                    {scanVariants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {buildVariantLabel(variant)} (stock: {Number.parseInt(variant.stock_quantity, 10) || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-xl border border-[#dbe7e0] bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Sell Quantity</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {[1, 2, 5].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => {
                        setSellQuantity(qty);
                        setSellQuantityInput(String(qty));
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                        activeSellQuantity === qty
                          ? 'border-[#2E5C45] bg-[#2E5C45]/10 text-[#2E5C45]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    value={sellQuantityInput}
                    onChange={(event) => setSellQuantityInput(event.target.value)}
                    onBlur={() => {
                      const parsed = Number.parseInt(String(sellQuantityInput || '').trim(), 10);
                      const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
                      setSellQuantity(normalized);
                      setSellQuantityInput(String(normalized));
                    }}
                    className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={sellOneViaScan}
                  disabled={quickSellDisabled}
                  className="rounded-xl bg-[#2E5C45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-50"
                >
                  {quickSelling ? 'Processing...' : `Sell ${activeSellQuantity}`}
                </button>
                {publicProductHref && (
                  <Link
                    href={publicProductHref}
                    target="_blank"
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Open public page
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses(statusMeta.tone)}`}>
          <h2 className="font-bold">{statusMeta.title}</h2>
          <p className="mt-1 text-sm">{statusMeta.message}</p>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

        <details className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-bold text-gray-900">Summary (collapsed)</summary>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>Product: <span className="font-semibold">{product.name}</span></p>
            <p>Price: <span className="font-semibold">₦{Number(displayPrice || 0).toLocaleString()}</span></p>
            <p>Stock: <span className="font-semibold">{Number.parseInt(product.stock_quantity, 10) || 0}</span></p>
            <p>SKU: <span className="font-semibold">{product.sku || 'N/A'}</span></p>
          </div>
        </details>

        <details className="rounded-2xl border border-[#dbe7e0] bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-bold text-gray-900">Buyer Reviews (collapsed)</summary>
          <div className="mt-3">
            <ProductReviewsManager productId={productId} />
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/store/dashboard/products" className="text-sm font-semibold text-[#2E5C45] hover:text-[#254a38]">
            ← Back to products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicProductHref && product.moderation_status === 'approved' && (
            <Link
              href={publicProductHref}
              target="_blank"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View live
            </Link>
          )}
          <button
            type="button"
            onClick={printProductLabel}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Print labels
          </button>
          <button
            type="button"
            onClick={duplicateProduct}
            disabled={acting}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] disabled:opacity-50"
          >
            Duplicate
          </button>
          {product.moderation_status === 'archived' ? (
            <button
              type="button"
              onClick={() => toggleArchive(false)}
              disabled={acting}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleArchive(true)}
              disabled={acting}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Archive
            </button>
          )}
          {['draft', 'rejected', 'archived'].includes(product.moderation_status) && (
            <button
              type="button"
              onClick={deleteProduct}
              disabled={acting}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses(statusMeta.tone)}`}>
        <h2 className="font-bold">{statusMeta.title}</h2>
        <p className="mt-1 text-sm">{statusMeta.message}</p>
        {product.rejection_reason && (
          <p className="mt-2 rounded bg-white/70 px-2 py-1 text-sm font-medium">Rejection: {product.rejection_reason}</p>
        )}
      </div>

      {isScanMode && (
        <div className="rounded-2xl border border-[#cfe1d7] bg-[#f6faf7] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E5C45]">Scan Mode</p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">Quick POS Action</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Price</p>
              <p className="mt-1 text-sm font-bold text-gray-900">₦{Number(displayPrice || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Stock</p>
              <p className="mt-1 text-sm font-bold text-gray-900">{Number.parseInt(product.stock_quantity, 10) || 0}</p>
            </div>
            <div className="rounded-xl border border-[#dbe7e0] bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">SKU</p>
              <p className="mt-1 truncate text-sm font-bold text-gray-900">{product.sku || 'N/A'}</p>
            </div>
          </div>
          {hasScanVariants && (
            <div className="mt-3 rounded-xl border border-[#dbe7e0] bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Variant</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={selectedScanVariantId}
                  onChange={(event) => setSelectedScanVariantId(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  {scanVariants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {buildVariantLabel(variant)} (stock: {Number.parseInt(variant.stock_quantity, 10) || 0})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Selected stock: <span className="font-semibold text-gray-700">{selectedScanVariantStock}</span>
                </p>
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sellOneViaScan}
              disabled={quickSellDisabled}
              className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-50"
            >
              {quickSelling ? 'Processing...' : hasScanVariants ? 'Sell One Variant (-1)' : 'Sell One (-1)'}
            </button>
            {publicProductHref && (
              <Link
                href={publicProductHref}
                target="_blank"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open public page
              </Link>
            )}
          </div>
        </div>
      )}

      <StepIndicator currentStep={currentStep} />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            <p className="mt-1 text-sm text-gray-500">Enter your product's core details</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Product name *</span>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Slug *</span>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                  value={form.slug}
                  onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Description *</span>
                <textarea
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Price *</span>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                    value={form.price}
                    onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Sale price</span>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                    value={form.discount_price}
                    onChange={(e) => setForm((c) => ({ ...c, discount_price: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Stock quantity *</span>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((c) => ({ ...c, stock_quantity: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => goToStep(2)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white">
              Continue <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Media */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Media</h2>
                <p className="mt-1 text-sm text-gray-500">Upload at least 1 image. Choose your cover image.</p>
              </div>
              <label className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" multiple className="hidden" onChange={onFilesSelected} />
              </label>
            </div>

            <div className="mt-6 space-y-3">
              {media.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                    {item.type === 'image' ? (
                      <img src={item.public_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold">VIDEO</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.public_url}</p>
                    <p className="text-xs text-gray-500 uppercase">{item.type}</p>
                  </div>
                  {item.type === 'image' && (
                    <label className="flex items-center gap-1 px-2 text-xs">
                      <input
                        type="radio"
                        name="primary"
                        checked={primaryImageUrl === item.public_url}
                        onChange={() => setPrimaryImageUrl(item.public_url)}
                      />
                      Cover
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {media.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                  Upload at least one image to proceed.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => goToStep(1)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold">
              <FiChevronLeft className="inline mr-2" size={16} /> Back
            </button>
            <button onClick={() => goToStep(3)} disabled={images.length === 0} className="flex-1 rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              Continue <FiChevronRight className="inline ml-2" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
              <button
                type="button"
                onClick={() => setForm((c) => ({ ...c, specifications: [...c.specifications, createEmptySpecification()] }))}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add spec
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Material, size, features, etc.</p>

            <div className="mt-6 space-y-3">
              {form.specifications.map((spec, index) => (
                <div key={`spec-${index}`} className="flex gap-2 items-end">
                  <input
                    placeholder="Label (e.g., Material)"
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  />
                  <input
                    placeholder="Value (e.g., Cotton)"
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({
                      ...c,
                      specifications:  c.specifications.filter((_, i) => i !== index) || [createEmptySpecification()],
                    }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Bulk Pricing Tiers</h2>
              <button
                type="button"
                onClick={() => setForm((c) => ({ ...c, bulk_discount_tiers: [...c.bulk_discount_tiers, createEmptyBulkTier()] }))}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add tier
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Offer discounts for higher quantities</p>

            <div className="mt-6 space-y-3">
              {form.bulk_discount_tiers.map((tier, index) => (
                <div key={`tier-${index}`} className="flex gap-2 items-end rounded-xl border border-gray-200 p-3">
                  <input
                    type="number"
                    min="2"
                    placeholder="Min qty"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={tier.minimum_quantity}
                    onChange={(e) => updateBulkDiscountTier(index, 'minimum_quantity', e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Discount %"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={tier.discount_percent}
                    onChange={(e) => updateBulkDiscountTier(index, 'discount_percent', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({
                      ...c,
                      bulk_discount_tiers: c.bulk_discount_tiers.filter((_, i) => i !== index) || [createEmptyBulkTier()],
                    }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => goToStep(2)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold">
              <FiChevronLeft className="inline mr-2" size={16} /> Back
            </button>
            <button onClick={() => goToStep(4)} className="flex-1 rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white">
              Continue <FiChevronRight className="inline ml-2" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Product name</p>
                  <p className="font-semibold text-gray-900">{form.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900">₦{Number(form.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Stock</p>
                  <p className="font-semibold text-gray-900">{form.stock_quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-500">Images</p>
                  <p className="font-semibold text-gray-900">{images.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Actions</h2>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => saveProduct(false)}
                  disabled={saving}
                  className="w-full rounded-xl border border-[#2E5C45] px-4 py-3 text-sm font-semibold text-[#2E5C45] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {product.moderation_status !== 'pending_review' && product.moderation_status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => saveProduct(true)}
                    disabled={saving}
                    className="w-full rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-50"
                  >
                    {saving ? 'Submitting...' : 'Submit for review'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ProductReviewsManager productId={productId} />

          <div className="flex gap-3">
            <button onClick={() => goToStep(3)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold">
              <FiChevronLeft className="inline mr-2" size={16} /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
