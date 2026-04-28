'use client';

import {
  AdminRankingDebugForm,
  AdminRankingDebugIntro,
  AdminRankingDebugMeta,
  AdminRankingDebugResults,
} from '@/features/admin/ranking-debug/AdminRankingDebugSections';
import useAdminRankingDebug from '@/features/admin/ranking-debug/useAdminRankingDebug';

export default function AdminRankingDebugPage() {
  const rankingDebug = useAdminRankingDebug();

  return (
    <div className="space-y-6">
      <AdminRankingDebugIntro />
      <AdminRankingDebugForm
        filters={rankingDebug.filters}
        requestPreview={rankingDebug.requestPreview}
        loading={rankingDebug.loading}
        error={rankingDebug.error}
        onUpdateFilter={rankingDebug.updateFilter}
        onReset={rankingDebug.reset}
        onSubmit={rankingDebug.runDebug}
      />
      <AdminRankingDebugMeta result={rankingDebug.result} />
      <AdminRankingDebugResults result={rankingDebug.result} />
    </div>
  );
}
