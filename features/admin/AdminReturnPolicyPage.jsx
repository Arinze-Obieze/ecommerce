'use client';

import {
  AdminReturnPolicyForm,
  AdminReturnPolicyIntro,
  AdminReturnPolicyLoading,
} from '@/features/admin/return-policy/AdminReturnPolicySections';
import useAdminReturnPolicy from '@/features/admin/return-policy/useAdminReturnPolicy';

export default function AdminReturnPolicyPage() {
  const policy = useAdminReturnPolicy();

  if (policy.loading) {
    return <AdminReturnPolicyLoading />;
  }

  return (
    <div className="space-y-4">
      <AdminReturnPolicyIntro />
      <AdminReturnPolicyForm
        error={policy.error}
        notice={policy.notice}
        form={policy.form}
        saving={policy.saving}
        changed={policy.changed}
        onUpdateField={policy.updateField}
        onUpdateRow={policy.updateRow}
        onAddRow={policy.addRow}
        onRemoveRow={policy.removeRow}
        onRefresh={policy.load}
        onSave={policy.save}
      />
    </div>
  );
}
