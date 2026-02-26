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

async function findAuthUserByEmail(adminClient, email) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { user: null, error };
    }

    const users = data?.users || [];
    const match = users.find((user) => normalizeEmail(user.email) === normalizedEmail);
    if (match) {
      return { user: match, error: null };
    }

    if (users.length < perPage) {
      return { user: null, error: null };
    }

    page += 1;
  }
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
    const { data: authUserLookup, error: authUserLookupError } = await adminClient.auth.admin.getUserById(ownerUserId);
    if (authUserLookupError || !authUserLookup?.user?.id) {
      return { ok: false, status: 404, error: 'Auth user not found for this user_id' };
    }

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
      const authEmail = normalizeEmail(authUserLookup.user.email);
      const displayName = authUserLookup.user.user_metadata?.full_name || deriveNameFromEmail(authEmail);
      const { data: insertedRows, error: insertProfileError } = await adminClient
        .from('users')
        .insert({
          id: ownerUserId,
          email: authEmail,
          full_name: displayName,
          phone: null,
          state: null,
          avatar: null,
        })
        .select('id, email, full_name')
        .limit(1);

      if (insertProfileError) {
        return { ok: false, status: 500, error: insertProfileError.message };
      }

      return {
        ok: true,
        targetUser: insertedRows?.[0] || { id: ownerUserId, email: authEmail, full_name: displayName },
        createdAccount: false,
        temporaryPassword: null,
      };
    }

    return { ok: true, targetUser: userById, createdAccount: false, temporaryPassword: null };
  }

  const normalizedEmail = normalizeEmail(ownerEmail);
  const { user: authUserByEmail, error: authLookupError } = await findAuthUserByEmail(adminClient, normalizedEmail);
  if (authLookupError) {
    return { ok: false, status: 500, error: authLookupError.message };
  }

  const { data: existingByEmail, error: existingByEmailError } = await adminClient
    .from('users')
    .select('id, email, full_name')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingByEmailError) {
    return { ok: false, status: 500, error: existingByEmailError.message };
  }

  if (authUserByEmail?.id) {
    if (existingByEmail?.id === authUserByEmail.id) {
      return { ok: true, targetUser: existingByEmail, createdAccount: false, temporaryPassword: null };
    }

    const defaultName = authUserByEmail.user_metadata?.full_name || deriveNameFromEmail(normalizedEmail);
    const { data: upsertedRows, error: upsertProfileError } = await adminClient
      .from('users')
      .upsert(
        {
          id: authUserByEmail.id,
          email: normalizedEmail,
          full_name: defaultName,
          phone: null,
          state: null,
          avatar: null,
        },
        { onConflict: 'id' }
      )
      .select('id, email, full_name')
      .limit(1);

    if (upsertProfileError) {
      return { ok: false, status: 500, error: upsertProfileError.message };
    }

    return {
      ok: true,
      targetUser: upsertedRows?.[0] || { id: authUserByEmail.id, email: normalizedEmail, full_name: defaultName },
      createdAccount: false,
      temporaryPassword: null,
    };
  }

  if (existingByEmail) {
    // Orphan public profile row with no matching auth account.
    await adminClient.from('users').delete().eq('id', existingByEmail.id);
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

async function rollbackCreatedUser(adminClient, userId) {
  if (!userId) return { ok: true };

  const { error: profileDeleteError } = await adminClient
    .from('users')
    .delete()
    .eq('id', userId);

  if (profileDeleteError) {
    // Best-effort rollback: continue to auth cleanup even if profile delete fails.
    console.error('Rollback profile delete failed:', profileDeleteError.message);
  }

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    console.error('Rollback auth delete failed:', authDeleteError.message);
  }

  if (profileDeleteError || authDeleteError) {
    return {
      ok: false,
      error: 'Rollback failed after email failure. Manual cleanup may be required.',
      details: {
        profileDeleteError: profileDeleteError?.message || null,
        authDeleteError: authDeleteError?.message || null,
      },
    };
  }

  return { ok: true };
}

export async function POST(request, { params }) {
  try {
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
    const isNewAccount = Boolean(resolved.createdAccount);
    const recipient = targetUser.email || ownerEmail || null;
    const ownerName = recipient ? (targetUser.full_name || deriveNameFromEmail(recipient)) : 'there';

    if (isNewAccount) {
      const credentialsMail = await sendZeptoMail({
        to: recipient,
        subject: `Your new account and store ownership for ${store.name}`,
        html: `<p>Hello ${ownerName},</p><p>An account has been created for you and you have been assigned as <strong>owner</strong> of <strong>${store.name}</strong>.</p><p><strong>Email:</strong> ${recipient}<br/><strong>Temporary Password:</strong> ${resolved.temporaryPassword}</p><p>Please sign in and change your password immediately.</p>`,
        text: `Hello ${ownerName},\n\nAn account has been created for you and you have been assigned as owner of ${store.name}.\n\nEmail: ${recipient}\nTemporary Password: ${resolved.temporaryPassword}\n\nPlease sign in and change your password immediately.`,
      });

      if (!credentialsMail.ok) {
        const rollback = await rollbackCreatedUser(admin.adminClient, targetUser.id);
        if (!rollback.ok) {
          return NextResponse.json(
            {
              error: rollback.error,
              details: rollback.details,
            },
            { status: 500 }
          );
        }
        return NextResponse.json(
          {
            error: credentialsMail.error || 'Failed to send credentials email; account was rolled back',
            ...(credentialsMail.details ? { details: credentialsMail.details } : {}),
          },
          { status: credentialsMail.status || 502 }
        );
      }
    }

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
      if (isNewAccount) {
        const rollback = await rollbackCreatedUser(admin.adminClient, targetUser.id);
        if (!rollback.ok) {
          return NextResponse.json(
            {
              error: rollback.error,
              details: rollback.details,
            },
            { status: 500 }
          );
        }
      }
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    // Optional governance convenience: activate store once owner is assigned.
    if (store.status !== 'active') {
      const { error: activateError } = await admin.adminClient
        .from('stores')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: admin.user.id,
        })
        .eq('id', store.id);

      if (activateError) {
        if (isNewAccount) {
          const rollback = await rollbackCreatedUser(admin.adminClient, targetUser.id);
          if (!rollback.ok) {
            return NextResponse.json(
              {
                error: rollback.error,
                details: rollback.details,
              },
              { status: 500 }
            );
          }
        }
        return NextResponse.json({ error: activateError.message }, { status: 500 });
      }
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

    let mailStatus = isNewAccount ? 'sent' : 'skipped';
    let mailError = null;

    if (!isNewAccount && recipient) {
      const emailResult = await sendZeptoMail({
        to: recipient,
        subject: `You are now owner of ${store.name}`,
        html: `<p>Hello ${ownerName},</p><p>You have been assigned as <strong>owner</strong> of <strong>${store.name}</strong>.</p><p>Please sign in to your dashboard.</p>`,
        text: `Hello ${ownerName},\n\nYou have been assigned as owner of ${store.name}.\nPlease sign in to your dashboard.`,
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
  } catch (error) {
    console.error('assign-owner fatal error:', error);
    return NextResponse.json({ error: 'Failed to assign owner due to an unexpected server error' }, { status: 500 });
  }
}
