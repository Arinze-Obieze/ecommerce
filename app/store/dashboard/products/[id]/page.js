'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

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

export default function StoreProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(createInitialForm(null));
  const [media, setMedia] = useState([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [acting, setActing] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const printProductLabel = () => {
    if (!product?.sku) {
      setError('A product SKU is required before printing labels.');
      return;
    }

    const label = product.name || 'Product';
    const w = window.open('', '_blank', 'width=820,height=620');
    if (!w) return;
    w.document.write(`<html><head><title>Print Labels</title><style>
      body{font-family:monospace;margin:0;padding:16px}
      .g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .l{border:1px solid #ccc;padding:14px;text-align:center;page-break-inside:avoid}
      .l h4{margin:0 0 6px;font-size:10px;color:#666}
      .l .s{font-size:13px;font-weight:bold;letter-spacing:1.5px}
      .b{display:flex;justify-content:center;gap:1px;margin:6px 0;height:45px;align-items:flex-end}
      .br{background:#000;border-radius:.5px}
    </style></head><body><div class="g"><div class="l"><h4>${label}</h4><div class="b">${
      product.sku.split("").map((ch) => `<div class="br" style="width:${ch === "-" ? 1 : (ch.charCodeAt(0) % 3) + 2}px;height:${55 + (ch.charCodeAt(0) % 40)}%"></div>`).join("")
    }</div><div class="s">${product.sku}</div></div></div><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    setNotice('Print view opened. Labels can be reprinted from this page any time.');
  };

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
  };

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
      setNotice('Media uploaded. Save changes when you are ready.');
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

  const duplicateProduct = async () => {
    try {
      setActing('duplicate');
      setError('');
      setNotice('');
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to duplicate product');
      router.push(`/store/dashboard/products/${json.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to duplicate product');
    } finally {
      setActing('');
    }
  };

  const toggleArchive = async (archive) => {
    try {
      setActing(archive ? 'archive' : 'unarchive');
      setError('');
      setNotice('');
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update archive status');
      await loadProduct();
      setNotice(archive ? 'Product archived.' : 'Product moved back to draft.');
    } catch (err) {
      setError(err.message || 'Failed to update archive status');
    } finally {
      setActing('');
    }
  };

  const deleteProduct = async () => {
    try {
      setActing('delete');
      setError('');
      setNotice('');
      const res = await fetch(`/api/store/products/${productId}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to delete product');
      router.push('/store/dashboard/products');
    } catch (err) {
      setError(err.message || 'Failed to delete product');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/store/dashboard/products" className="text-sm font-semibold text-[#2E5C45] hover:text-[#254a38]">
            Back to products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">SKU: {product.sku || 'Generated automatically'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicProductHref && product.moderation_status === 'approved' ? (
            <Link
              href={publicProductHref}
              target="_blank"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Open listing
            </Link>
          ) : null}
          <button
            type="button"
            onClick={duplicateProduct}
            disabled={acting === 'duplicate'}
            className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] disabled:opacity-50"
          >
            {acting === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
          </button>
          <button
            type="button"
            onClick={printProductLabel}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Print Labels
          </button>
          {product.moderation_status === 'archived' ? (
            <button
              type="button"
              onClick={() => toggleArchive(false)}
              disabled={acting === 'unarchive'}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
            >
              {acting === 'unarchive' ? 'Unarchiving...' : 'Unarchive'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleArchive(true)}
              disabled={acting === 'archive'}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
            >
              {acting === 'archive' ? 'Archiving...' : 'Archive'}
            </button>
          )}
          {['draft', 'rejected', 'archived'].includes(product.moderation_status) ? (
            <button
              type="button"
              onClick={deleteProduct}
              disabled={acting === 'delete'}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
            >
              {acting === 'delete' ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 shadow-sm ${toneClasses(statusMeta.tone)}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{product.moderation_status?.replace('_', ' ') || 'draft'}</p>
            <h2 className="mt-1 text-lg font-bold">{statusMeta.title}</h2>
            <p className="mt-1 text-sm opacity-80">{statusMeta.message}</p>
            {product.rejection_reason ? (
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-red-800">
                Rejection reason: {product.rejection_reason}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <p className="text-xs uppercase opacity-70">Submitted</p>
              <p className="mt-1 font-semibold">{product.submitted_at ? new Date(product.submitted_at).toLocaleString() : 'Not yet'}</p>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <p className="text-xs uppercase opacity-70">Updated</p>
              <p className="mt-1 font-semibold">{product.updated_at ? new Date(product.updated_at).toLocaleString() : 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Core details</h2>
              <p className="text-sm text-gray-500">Update the product information buyers and reviewers will see.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Product name</span>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Slug</span>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.slug}
                  onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Description</span>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Price</span>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.price}
                  onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Discount price</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.discount_price}
                  onChange={(e) => setForm((current) => ({ ...current, discount_price: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-gray-700">Stock quantity</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((current) => ({ ...current, stock_quantity: e.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Media</h2>
                <p className="text-sm text-gray-500">Keep at least one image and choose which image leads the listing.</p>
              </div>
              <label className="rounded-xl border border-[#2E5C45] px-4 py-2 text-sm font-semibold text-[#2E5C45] cursor-pointer">
                {uploading ? 'Uploading...' : 'Add media'}
                <input type="file" multiple className="hidden" onChange={onFilesSelected} />
              </label>
            </div>

            <div className="space-y-3">
              {media.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.public_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">VIDEO</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.public_url}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{item.type}</p>
                  </div>
                  {item.type === 'image' ? (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="primary-image"
                        checked={primaryImageUrl === item.public_url}
                        onChange={() => setPrimaryImageUrl(item.public_url)}
                      />
                      Primary
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeMedia(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {media.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                  Upload at least one image to keep this product publishable.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
                <p className="text-sm text-gray-500">Capture details like material, fit, dimensions, or care.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, specifications: [...current.specifications, createEmptySpecification()] }))}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add spec
              </button>
            </div>
            <div className="space-y-3">
              {form.specifications.map((spec, index) => (
                <div key={`spec-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Label"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  />
                  <input
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({
                      ...current,
                      specifications: current.specifications.length > 1
                        ? current.specifications.filter((_, specIndex) => specIndex !== index)
                        : [createEmptySpecification()],
                    }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Bulk discounts</h2>
                <p className="text-sm text-gray-500">Offer stronger pricing as order quantities go up.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, bulk_discount_tiers: [...current.bulk_discount_tiers, createEmptyBulkTier()] }))}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add tier
              </button>
            </div>
            <div className="space-y-3">
              {form.bulk_discount_tiers.map((tier, index) => (
                <div key={`tier-${index}`} className="rounded-xl border border-gray-200 p-3">
                  <div className="grid gap-3">
                    <input
                      type="number"
                      min="2"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Minimum quantity"
                      value={tier.minimum_quantity}
                      onChange={(e) => updateBulkDiscountTier(index, 'minimum_quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="99"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Discount percent"
                      value={tier.discount_percent}
                      onChange={(e) => updateBulkDiscountTier(index, 'discount_percent', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({
                        ...current,
                        bulk_discount_tiers: current.bulk_discount_tiers.length > 1
                          ? current.bulk_discount_tiers.filter((_, tierIndex) => tierIndex !== index)
                          : [createEmptyBulkTier()],
                      }))}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
                    >
                      Remove tier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Review actions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Drafts and rejected items can be resubmitted. Approved products automatically go back into review when edited.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => saveProduct(false)}
                disabled={saving}
                className="w-full rounded-xl border border-[#2E5C45] px-4 py-3 text-sm font-semibold text-[#2E5C45] disabled:opacity-50"
              >
                {saving ? 'Saving...' : product.moderation_status === 'approved' ? 'Save changes' : 'Save draft changes'}
              </button>
              {product.moderation_status !== 'pending_review' && product.moderation_status !== 'archived' ? (
                <button
                  type="button"
                  onClick={() => saveProduct(true)}
                  disabled={saving}
                  className="w-full rounded-xl bg-[#2E5C45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-50"
                >
                  {saving ? 'Submitting...' : product.moderation_status === 'rejected' ? 'Resubmit for review' : 'Submit for review'}
                </button>
              ) : null}
            </div>

            <div className="mt-5 rounded-xl bg-[#f6faf7] p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Current primary image</p>
              <p className="mt-1 truncate">{primaryImageUrl || 'Choose one from the media list above.'}</p>
              <p className="mt-3 font-semibold text-gray-900">Image count</p>
              <p className="mt-1">{images.length} image(s)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
