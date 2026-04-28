'use client';

import {
  StoreSettingsForm,
  StoreSettingsIntro,
  StoreSettingsMetaCards,
} from '@/features/store-console/settings/StoreSettingsSections';
import useStoreSettings from '@/features/store-console/settings/useStoreSettings';

export default function StoreSettingsPage() {
  const settings = useStoreSettings();
  const { loading, meta, snapshot } = settings;

  if (loading) {
    return <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 text-sm text-gray-500">Loading store settings...</div>;
  }

  return (
    <div className="space-y-6">
      <StoreSettingsIntro />
      <StoreSettingsMetaCards meta={meta} snapshot={snapshot} />
      <StoreSettingsForm
        error={settings.error}
        notice={settings.notice}
        meta={settings.meta}
        form={settings.form}
        setForm={settings.setForm}
        changed={settings.changed}
        saving={settings.saving}
        uploadingLogo={settings.uploadingLogo}
        onSave={settings.onSave}
        onRefresh={settings.load}
        onLogoFileChange={settings.onLogoFileChange}
      />
    </div>
  );
}
