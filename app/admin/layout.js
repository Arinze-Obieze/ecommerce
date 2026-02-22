import { requireAdminPage } from '@/utils/adminAuth';
import AdminShell from '@/components/Admin/AdminShell';

export default async function AdminLayout({ children }) {
  const { user, membership } = await requireAdminPage();

  return (
    <AdminShell userEmail={user.email} roleLabel={membership.role.replace('_', ' ')}>
      {children}
    </AdminShell>
  );
}
