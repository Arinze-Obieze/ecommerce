import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { writeAdminAuditLog } from '@/utils/adminAudit';
import { enforceRateLimit } from '@/utils/rateLimit';
import { sendZeptoMail } from '@/utils/email';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function deriveNameFromEmail(email) {
  const local = String(email || '').split('@')[0] || 'Store Owner';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase()) || 'Store Owner';
}

function generateTemporaryPassword(length = 14) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?';
  const bytes = randomBytes(length);
  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += alphabet[bytes[index] % alphabet.length];
  }
  return password;
}

async function resolveStore(supabase, idOrSlug) {
  let query = supabase
    .from('stores')
    .select('id, name, slug, status, approved_at, approved_by')
    .limit(1);

  query = isUuid(idOrSlug) ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);

  return query.maybeSingle();
}

async function resolveOrCreateTargetUser(adminClient, ownerUserId, ownerEmail) {
  if (ownerUserId) {
    const { data: userById, error: userByIdError } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .eq('id', ownerUserId)
      .limit(1)
      .maybeSingle();

    if (userByIdError) {
      return { ok: false, status: 500, error: userByIdError.message };
    }

    if (!userById) {
      return { ok: false, status: 404, error: 'User not found for this user_id' };
    }

    return { ok: true, targetUser: userById, createdAccount: false, temporaryPassword: null };
  }

  const normalizedEmail = normalizeEmail(ownerEmail);
  const { data: existingByEmail, error: existingByEmailError } = await adminClient
    .from('users')
    .select('id, email, full_name')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existingByEmailError) {
    return { ok: false, status: 500, error: existingByEmailError.message };
  }

  if (existingByEmail) {
    return { ok: true, targetUser: existingByEmail, createdAccount: false, temporaryPassword: null };
  }

  const temporaryPassword = generateTemporaryPassword();
  const defaultName = deriveNameFromEmail(normalizedEmail);

  const { data: createdAuthUserData, error: createAuthError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: defaultName,
    },
  });

  if (createAuthError || !createdAuthUserData?.user?.id) {
    return {
      ok: false,
      status: 400,
      error: createAuthError?.message || 'Failed to create auth user',
    };
  }

  const { data: insertedUserRows, error: insertUserError } = await adminClient
    .from('users')
    .insert({
      id: createdAuthUserData.user.id,
      full_name: defaultName,
      email: normalizedEmail,
      state: null,
      phone: null,
      avatar: null,
    })
    .select('id, email, full_name')
    .limit(1);

  if (insertUserError) {
    await adminClient.auth.admin.deleteUser(createdAuthUserData.user.id).catch(() => null);
    return { ok: false, status: 500, error: insertUserError.message };
  }

  const insertedUser = insertedUserRows?.[0];
  if (!insertedUser) {
    return { ok: false, status: 500, error: 'User profile was not created after auth user creation' };
  }

  return {
    ok: true,
    targetUser: insertedUser,
    createdAccount: true,
    temporaryPassword,
  };
}

export async function POST(request, { params }) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_assign_owner',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many write requests' }, { status: 429 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const ownerUserId = String(body?.user_id || '').trim();
  const ownerEmail = normalizeEmail(body?.email);

  if ((!ownerUserId && !ownerEmail) || (ownerUserId && ownerEmail)) {
    return NextResponse.json(
      { error: 'Provide exactly one identifier: user_id or email' },
      { status: 400 }
    );
  }

  if (ownerUserId && !isUuid(ownerUserId)) {
    return NextResponse.json({ error: 'Valid owner user_id is required' }, { status: 400 });
  }

  if (ownerEmail && !isValidEmail(ownerEmail)) {
    return NextResponse.json({ error: 'Valid owner email is required' }, { status: 400 });
  }

  const { data: store, error: storeError } = await resolveStore(admin.adminClient, id);

  if (storeError) {
    return NextResponse.json({ error: storeError.message }, { status: 500 });
  }

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const resolved = await resolveOrCreateTargetUser(admin.adminClient, ownerUserId, ownerEmail);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error || 'Unable to resolve target user' }, { status: resolved.status || 500 });
  }
  const targetUser = resolved.targetUser;

  const { data: activeOwners } = await admin.adminClient
    .from('store_users')
    .select('id, user_id, role, status')
    .eq('store_id', store.id)
    .eq('role', 'owner')
    .eq('status', 'active');

  // Revoke any active owner mappings first
  await admin.adminClient
    .from('store_users')
    .update({ status: 'revoked' })
    .eq('store_id', store.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .neq('user_id', targetUser.id);

  const { error: upsertError } = await admin.adminClient
    .from('store_users')
    .upsert(
      {
        store_id: store.id,
        user_id: targetUser.id,
        role: 'owner',
        status: 'active',
        created_by: admin.user.id,
      },
      { onConflict: 'store_id,user_id' }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  // Optional governance convenience: activate store once owner is assigned.
  if (store.status !== 'active') {
    await admin.adminClient
      .from('stores')
      .update({
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: admin.user.id,
      })
      .eq('id', store.id);
  }

  await writeAdminAuditLog(admin.adminClient, {
    actorUserId: admin.user.id,
    actorAdminUserId: admin.membership.id,
    action: 'STORE_OWNER_ASSIGNED',
    targetType: 'store',
    targetId: store.id,
    beforeData: { previousOwners: activeOwners || [] },
    afterData: {
      ownerUserId: targetUser.id,
      ownerEmail: targetUser.email || null,
      resolvedBy: ownerUserId ? 'user_id' : 'email',
      createdAccount: resolved.createdAccount,
    },
    metadata: {
      storeStatusBefore: store.status,
    },
  });

  let mailStatus = 'skipped';
  let mailError = null;
  const recipient = targetUser.email || ownerEmail || null;

  if (recipient) {
    const ownerName = targetUser.full_name || deriveNameFromEmail(recipient);
    const isNewAccount = Boolean(resolved.createdAccount);

    const subject = isNewAccount
      ? `Your new account and store ownership for ${store.name}`
      : `You are now owner of ${store.name}`;
    const html = isNewAccount
      ? `<p>Hello ${ownerName},</p><p>An account has been created for you and you have been assigned as <strong>owner</strong> of <strong>${store.name}</strong>.</p><p><strong>Email:</strong> ${recipient}<br/><strong>Temporary Password:</strong> ${resolved.temporaryPassword}</p><p>Please sign in and change your password immediately.</p>`
      : `<p>Hello ${ownerName},</p><p>You have been assigned as <strong>owner</strong> of <strong>${store.name}</strong>.</p><p>Please sign in to your dashboard.</p>`;
    const text = isNewAccount
      ? `Hello ${ownerName},\n\nAn account has been created for you and you have been assigned as owner of ${store.name}.\n\nEmail: ${recipient}\nTemporary Password: ${resolved.temporaryPassword}\n\nPlease sign in and change your password immediately.`
      : `Hello ${ownerName},\n\nYou have been assigned as owner of ${store.name}.\nPlease sign in to your dashboard.`;

    const emailResult = await sendZeptoMail({
      to: recipient,
      subject,
      html,
      text,
    });

    if (emailResult.ok) {
      mailStatus = 'sent';
    } else {
      mailStatus = 'failed';
      mailError = emailResult.error || 'Failed to send notification email';
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      store_id: store.id,
      store_name: store.name,
      owner_user_id: targetUser.id,
      owner_email: targetUser.email || null,
      owner_full_name: targetUser.full_name || null,
      owner_role: 'owner',
      account_created: Boolean(resolved.createdAccount),
      email_status: mailStatus,
      ...(mailError ? { email_error: mailError } : {}),
    },
  });
}
