'use client';

import {
  AdminLogsHeader,
  AdminLogsPagination,
  AdminLogsTable,
} from '@/features/admin/logs/AdminLogsSections';
import useAdminLogs from '@/features/admin/logs/useAdminLogs';

export default function AdminLogsPage() {
  const logs = useAdminLogs();

  return (
    <div className="space-y-6">
      <AdminLogsHeader
        level={logs.level}
        setLevel={logs.setLevel}
        service={logs.service}
        setService={logs.setService}
        limit={logs.limit}
        onApply={logs.load}
        error={logs.error}
        summary={logs.summary}
      />

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <AdminLogsTable loading={logs.loading} rows={logs.rows} />
        <AdminLogsPagination loading={logs.loading} meta={logs.meta} page={logs.page} setPage={logs.setPage} limit={logs.limit} setLimit={logs.setLimit} load={logs.load} />
      </div>
    </div>
  );
}
