'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import {
  createInitialForm,
  createMediaFromProduct,
  inferMediaType,
} from '@/features/store-console/products/editor/productDetailEditor.utils';

export default function useProductEditorForm({
  product,
  productId,
  loadProduct,
  setError,
  setNotice,
}) {
  const [form, setForm] = useState(createInitialForm(null));
  const [media, setMedia] = useState([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(createInitialForm(product));

    const nextMedia = createMediaFromProduct(product);
    setMedia(nextMedia);

    const firstImage = nextMedia.find((item) => item.type === 'image');
    setPrimaryImageUrl(product?.image_urls?.[0] || firstImage?.public_url || '');
  }, [product]);

  const updateSpecification = useCallback((index, field, value) => {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.map((specification, specificationIndex) => (
        specificationIndex === index ? { ...specification, [field]: value } : specification
      )),
    }));
  }, []);

  const updateBulkDiscountTier = useCallback((index, field, value) => {
    setForm((current) => ({
      ...current,
      bulk_discount_tiers: current.bulk_discount_tiers.map((tier, tierIndex) => (
        tierIndex === index ? { ...tier, [field]: value } : tier
      )),
    }));
  }, []);

  const removeMedia = useCallback((id) => {
    setMedia((current) => {
      const next = current.filter((item) => item.id !== id);

      if (!next.some((item) => item.public_url === primaryImageUrl)) {
        const nextPrimary = next.find((item) => item.type === 'image');
        setPrimaryImageUrl(nextPrimary?.public_url || '');
      }

      return next;
    });
  }, [primaryImageUrl]);

  const onFilesSelected = useCallback(async (event) => {
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

        const signResponse = await fetch('/api/store/products/media/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mime_type: file.type,
            byte_size: file.size,
          }),
        });
        const signJson = await signResponse.json();
        if (!signResponse.ok) {
          throw new Error(signJson.error || `Failed to sign upload for ${file.name}`);
        }

        const signedUpload = signJson.data;
        const { error: uploadError } = await supabase.storage
          .from(signedUpload.bucket)
          .uploadToSignedUrl(signedUpload.path, signedUpload.token, file);

        if (uploadError) {
          throw new Error(uploadError.message || `Upload failed for ${file.name}`);
        }

        uploaded.push({
          id: `${signedUpload.path}:${Date.now()}`,
          type: mediaType,
          public_url: signedUpload.public_url,
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
  }, [primaryImageUrl, setError, setNotice]);

  const buildPayload = useCallback((submitForReview) => {
    const images = media.filter((item) => item.type === 'image');
    const videos = media.filter((item) => item.type === 'video');

    if (images.length < 1) {
      throw new Error('At least one image is required.');
    }

    const selectedPrimary = primaryImageUrl || images[0]?.public_url;
    if (!images.some((item) => item.public_url === selectedPrimary)) {
      throw new Error('Primary image must be selected from uploaded images.');
    }

    const hasIncompleteSpecification = form.specifications.some((specification) => {
      const key = String(specification?.key || '').trim();
      const value = String(specification?.value || '').trim();
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
        .map((specification) => ({
          key: String(specification?.key || '').trim(),
          value: String(specification?.value || '').trim(),
        }))
        .filter((specification) => specification.key && specification.value),
      bulk_discount_tiers: form.bulk_discount_tiers
        .map((tier) => ({
          minimum_quantity: String(tier?.minimum_quantity || '').trim(),
          discount_percent: String(tier?.discount_percent || '').trim(),
        }))
        .filter((tier) => tier.minimum_quantity && tier.discount_percent),
      submit_for_review: submitForReview,
    };
  }, [form, media, primaryImageUrl]);

  const saveProduct = useCallback(async (submitForReview = false) => {
    try {
      setSaving(true);
      setError('');
      setNotice('');

      const payload = buildPayload(submitForReview);
      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update product');

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
  }, [buildPayload, loadProduct, product?.moderation_status, productId, setError, setNotice]);

  return {
    form,
    setForm,
    media,
    primaryImageUrl,
    setPrimaryImageUrl,
    saving,
    uploading,
    updateSpecification,
    updateBulkDiscountTier,
    removeMedia,
    onFilesSelected,
    saveProduct,
  };
}
