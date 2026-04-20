import { requireAdminPage } from '@/utils/admin/auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }) {
  const { user, membership } = await requireAdminPage();

  return (
    <AdminShell userEmail={user.email} roleLabel={membership.role.replace('_', ' ')}>
      {children}
    </AdminShell>
  );
}
