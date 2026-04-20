function rolePriority(role) {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'owner') return 3;
  if (normalized === 'manager') return 2;
  if (normalized === 'staff') return 1;
  return 0;
}

function pickBestStoreMembership(memberships) {
  if (!Array.isArray(memberships) || memberships.length === 0) return null;
  return [...memberships].sort((a, b) => {
    const priorityDiff = rolePriority(b.role) - rolePriority(a.role);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })[0];
}

export async function resolvePostLoginTarget(supabase, userId) {
  if (!userId) return '/login';

  const { data: adminMembership, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (!adminError && adminMembership?.id) {
    return '/admin';
  }

  const { data: storeMemberships, error: storeError } = await supabase
    .from('store_users')
    .select('id, role, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!storeError) {
    const bestMembership = pickBestStoreMembership(storeMemberships || []);
    if (bestMembership?.id) {
      return '/store/dashboard';
    }
  }

  return '/';
}
