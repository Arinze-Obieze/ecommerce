import { requireAdminPage } from '@/utils/admin/auth';

export const dynamic = 'force-dynamic';

function formatRole(role) {
  return String(role || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminProfilePage() {
  const { user, membership, adminClient } = await requireAdminPage();

  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('created_at, last_login_at')
    .eq('id', membership.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
        <p className="text-sm text-gray-500">Identity and access details for your admin account.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {user.user_metadata?.full_name || 'Admin User'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{formatRole(membership.role)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {membership.is_active ? 'Active' : 'Inactive'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Since</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {adminUser?.created_at ? new Date(adminUser.created_at).toLocaleString() : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Login</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {adminUser?.last_login_at ? new Date(adminUser.last_login_at).toLocaleString() : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
