import { requireAdminPage } from '@/utils/admin/auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }) {
  const { user, membership, mfaEnrolled, needsMfa } = await requireAdminPage();

  return (
    <AdminShell
      userEmail={user.email}
      roleLabel={membership.role.replace('_', ' ')}
      mfaEnrolled={mfaEnrolled}
      needsMfa={needsMfa}
    >
      {children}
    </AdminShell>
  );
}
