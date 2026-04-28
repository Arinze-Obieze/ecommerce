'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { initialStoreSettingsForm } from '@/features/store-console/settings/storeSettings.utils';

export default function useStoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [meta, setMeta] = useState({ role: '', can_edit: false });
  const [snapshot, setSnapshot] = useState(null);
  const [form, setForm] = useState(initialStoreSettingsForm);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/store/settings', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load settings');

      setSnapshot(json.data || null);
      setMeta(json.meta || { role: '', can_edit: false });
      setForm({
        name: json.data?.name || '',
        slug: json.data?.slug || '',
        description: json.data?.description || '',
        logo_url: json.data?.logo_url || '',
        low_stock_threshold: String(json.data?.low_stock_threshold ?? 5),
      });
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onLogoFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setUploadingLogo(true);
      setError('');
      setNotice('');
      const isSupportedType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      if (!isSupportedType) throw new Error('Upload a JPG, PNG, or WebP logo image.');

      const signResponse = await fetch('/api/store/settings/logo/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mime_type: file.type, byte_size: file.size }),
      });
      const signJson = await signResponse.json();
      if (!signResponse.ok) throw new Error(signJson.error || 'Failed to prepare logo upload');

      const signed = signJson.data;
      const supabase = createSupabaseClient();
      const { error: uploadError } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) throw new Error(uploadError.message || 'Logo upload failed');

      setForm((current) => ({ ...current, logo_url: signed.public_url || '' }));
      setNotice('Logo uploaded. Save settings to publish it.');
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const changed = useMemo(() => {
    if (!snapshot) return false;
    return (
      form.name !== (snapshot.name || '') ||
      form.slug !== (snapshot.slug || '') ||
      form.description !== (snapshot.description || '') ||
      form.logo_url !== (snapshot.logo_url || '') ||
      form.low_stock_threshold !== String(snapshot.low_stock_threshold ?? 5)
    );
  }, [form, snapshot]);

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const response = await fetch('/api/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, low_stock_threshold: Number.parseInt(form.low_stock_threshold, 10) }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to update settings');

      setSnapshot(json.data || null);
      setForm({
        name: json.data?.name || '',
        slug: json.data?.slug || '',
        description: json.data?.description || '',
        logo_url: json.data?.logo_url || '',
        low_stock_threshold: String(json.data?.low_stock_threshold ?? 5),
      });
      setNotice('Store settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    uploadingLogo,
    error,
    notice,
    meta,
    snapshot,
    form,
    setForm,
    changed,
    load,
    onSave,
    onLogoFileChange,
  };
}
