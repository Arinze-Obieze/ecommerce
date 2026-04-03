'use client';

import { useMemo, useState } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

function createInitialForm() {
  return {
    name: '',
    slug: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    submit_for_review: true,
    specifications: [{ key: '', value: '' }],
    bulk_discount_tiers: [{ minimum_quantity: '', discount_percent: '' }],
  };
}

function inferMediaType(file) {
  if (file?.type?.startsWith('image/')) return 'image';
  if (file?.type?.startsWith('video/')) return 'video';
  return '';
}

export default function CreateProductPanel({ onCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const [media, setMedia] = useState([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const imageCount = useMemo(() => media.filter((item) => item.type === 'image').length, [media]);

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
          storage_path: signed.path,
          mime_type: file.type,
          size_bytes: file.size,
          filename: file.name,
        });
      }

      setMedia((prev) => {
        const next = [...prev, ...uploaded];
        const firstImage = next.find((item) => item.type === 'image');
        if (!primaryImageUrl && firstImage) {
          setPrimaryImageUrl(firstImage.public_url);
        }
        return next;
      });
      setNotice('Media uploaded successfully.');
      event.target.value = '';
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (!next.find((item) => item.public_url === primaryImageUrl)) {
        const nextPrimary = next.find((item) => item.type === 'image');
        setPrimaryImageUrl(nextPrimary ? nextPrimary.public_url : '');
      }
      return next;
    });
  };

  const updateSpecification = (index, field, value) => {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.map((spec, specIndex) => (
        specIndex === index ? { ...spec, [field]: value } : spec
      )),
    }));
  };

  const addSpecification = () => {
    setForm((current) => ({
      ...current,
      specifications: [...current.specifications, { key: '', value: '' }],
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

  const addBulkDiscountTier = () => {
    setForm((current) => ({
      ...current,
      bulk_discount_tiers: [...current.bulk_discount_tiers, { minimum_quantity: '', discount_percent: '' }],
    }));
  };

  const removeBulkDiscountTier = (index) => {
    setForm((current) => ({
      ...current,
      bulk_discount_tiers: current.bulk_discount_tiers.filter((_, tierIndex) => tierIndex !== index),
    }));
  };

  const removeSpecification = (index) => {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.filter((_, specIndex) => specIndex !== index),
    }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const images = media.filter((item) => item.type === 'image');
      if (images.length < 1) {
        throw new Error('At least one image is required');
      }

      const selectedPrimary = primaryImageUrl || images[0].public_url;
      if (!images.find((item) => item.public_url === selectedPrimary)) {
        throw new Error('Primary image must be chosen from uploaded images');
      }

      const hasIncompleteSpecification = form.specifications.some((spec) => {
        const key = String(spec?.key || '').trim();
        const value = String(spec?.value || '').trim();
        return (key && !value) || (!key && value);
      });

      if (hasIncompleteSpecification) {
        throw new Error('Each specification must include both a name and a value.');
      }

      const specifications = form.specifications
        .map((spec) => ({
          key: String(spec?.key || '').trim(),
          value: String(spec?.value || '').trim(),
        }))
        .filter((spec) => spec.key && spec.value);

      const hasIncompleteBulkDiscountTier = form.bulk_discount_tiers.some((tier) => {
        const minimumQuantity = String(tier?.minimum_quantity || '').trim();
        const discountPercent = String(tier?.discount_percent || '').trim();
        return (minimumQuantity && !discountPercent) || (!minimumQuantity && discountPercent);
      });

      if (hasIncompleteBulkDiscountTier) {
        throw new Error('Each bulk discount tier must include both minimum quantity and discount percent.');
      }

      const bulkDiscountTiers = form.bulk_discount_tiers
        .map((tier) => ({
          minimum_quantity: String(tier?.minimum_quantity || '').trim(),
          discount_percent: String(tier?.discount_percent || '').trim(),
        }))
        .filter((tier) => tier.minimum_quantity && tier.discount_percent);

      const payload = {
        ...form,
        specifications,
        bulk_discount_tiers: bulkDiscountTiers,
        media,
        primary_image_url: selectedPrimary,
      };

      const res = await fetch('/api/store/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create product');

      setForm(createInitialForm());
      setMedia([]);
      setPrimaryImageUrl('');
      setNotice(payload.submit_for_review
        ? `Product submitted for admin review. SKU: ${json.data?.sku || 'Generated automatically'}.`
        : `Product saved as draft. SKU: ${json.data?.sku || 'Generated automatically'}.`);
      setIsOpen(false);
      if (typeof onCreated === 'function') {
        onCreated(json.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Create Product</h3>
          <p className="text-sm text-gray-500">Upload real media files and submit products for admin approval.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38]"
        >
          {isOpen ? 'Close Form' : 'Create Product'}
        </button>
      </div>

      {error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

      {isOpen ? (
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <input
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          <div className="rounded-xl border border-[#dbe7e0] bg-[#f7fbf8] px-3 py-3 text-sm text-gray-700 md:col-span-2">
            <p className="font-semibold text-gray-900">SKU is generated automatically</p>
            <p className="mt-1 text-xs text-gray-500">Pattern: `ZVA-STORE-PROD-0001` using your store code, product code, and the next sequence number for that store.</p>
          </div>
          <input
            type="number"
            min="1"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Discount price"
            value={form.discount_price}
            onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Stock quantity"
            value={form.stock_quantity}
            onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
            required
          />
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.submit_for_review}
              onChange={(e) => setForm((f) => ({ ...f, submit_for_review: e.target.checked }))}
            />
            Submit for review immediately
          </label>

          <div className="rounded-xl border border-gray-200 p-3 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Bulk Discounts</p>
                <p className="mt-1 text-xs text-gray-500">Offer automatic percentage discounts when buyers reach quantity thresholds, like 20% off at 40+ units.</p>
              </div>
              <button
                type="button"
                onClick={addBulkDiscountTier}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add Tier
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {form.bulk_discount_tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
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
                    step="0.01"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Discount percent"
                    value={tier.discount_percent}
                    onChange={(e) => updateBulkDiscountTier(index, 'discount_percent', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeBulkDiscountTier(index)}
                    disabled={form.bulk_discount_tiers.length <= 1}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-3 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Specifications</p>
                <p className="mt-1 text-xs text-gray-500">Add optional product details like material, fit, care, or dimensions.</p>
              </div>
              <button
                type="button"
                onClick={addSpecification}
                className="rounded-lg border border-[#2E5C45] px-3 py-2 text-xs font-semibold text-[#2E5C45]"
              >
                Add Specification
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {form.specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <input
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Specification name"
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
                    onClick={() => removeSpecification(index)}
                    disabled={form.specifications.length <= 1}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-3 md:col-span-2">
            <p className="text-sm font-semibold text-gray-900">Product Media</p>
            <p className="mt-1 text-xs text-gray-500">Upload images/videos. At least one image is required.</p>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onFilesSelected}
              disabled={uploading}
              className="mt-3 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef4f0] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#2E5C45]"
            />
            <p className="mt-2 text-xs text-gray-500">{uploading ? 'Uploading files...' : `${imageCount} image(s), ${media.length - imageCount} video(s)`}</p>

            <div className="mt-3 space-y-2">
              {media.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{item.filename}</p>
                    <p className="text-gray-500">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.type === 'image' ? (
                      <label className="flex items-center gap-1 text-gray-700">
                        <input
                          type="radio"
                          name="primary-image"
                          checked={primaryImageUrl === item.public_url}
                          onChange={() => setPrimaryImageUrl(item.public_url)}
                        />
                        Primary image
                      </label>
                    ) : (
                      <span className="text-gray-500">Video cannot be primary</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="rounded-md border border-red-200 px-2 py-1 font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {media.length === 0 ? <p className="text-xs text-gray-500">No media uploaded yet.</p> : null}
            </div>
          </div>

          <button
            disabled={saving || uploading}
            className="rounded-xl bg-[#2E5C45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#254a38] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
