'use client';

import { useMemo, useState } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  discount_price: '',
  stock_quantity: '',
  submit_for_review: true,
};

function inferMediaType(file) {
  if (file?.type?.startsWith('image/')) return 'image';
  if (file?.type?.startsWith('video/')) return 'video';
  return '';
}

export default function CreateProductPanel({ onCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
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

      const payload = {
        ...form,
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

      setForm(initialForm);
      setMedia([]);
      setPrimaryImageUrl('');
      setNotice(payload.submit_for_review
        ? 'Product submitted for admin review. It will stay hidden until approved.'
        : 'Product saved as draft.');
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
