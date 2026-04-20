import { sendZeptoMail } from '@/utils/messaging/email';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function roleLabel(role) {
  const value = String(role || '').trim().toLowerCase();
  if (!value) return 'team member';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCurrency(amount) {
  const parsed = Number(amount || 0);
  if (!Number.isFinite(parsed)) return 'NGN 0';
  return `NGN ${parsed.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function resolveSiteUrl() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function safeName(name, fallback = 'there') {
  const normalized = String(name || '').trim();
  return normalized || fallback;
}

export async function sendStoreAccessGrantedEmail({
  to,
  recipientName,
  storeName,
  role,
  assignedByName,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const byName = safeName(assignedByName, 'an administrator');
  const safeStoreName = escapeHtml(storeName || 'your store');
  const safeRole = roleLabel(role);
  const dashboardUrl = `${resolveSiteUrl()}/store/dashboard`;

  return sendZeptoMail({
    to: recipient,
    subject: `Access granted: ${storeName || 'Store'} (${safeRole})`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>${escapeHtml(byName)} added you to <strong>${safeStoreName}</strong> as <strong>${escapeHtml(safeRole)}</strong>.</p>` +
      `<p>You can sign in and manage your store account here: <a href="${dashboardUrl}">${dashboardUrl}</a>.</p>`,
    text:
      `Hello ${displayName},\n\n` +
      `${byName} added you to ${storeName || 'your store'} as ${safeRole}.\n` +
      `Sign in here: ${dashboardUrl}`,
  });
}

export async function sendStoreAccessUpdatedEmail({
  to,
  recipientName,
  storeName,
  role,
  status,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const safeStoreName = escapeHtml(storeName || 'your store');
  const safeRole = roleLabel(role);
  const safeStatus = String(status || '').trim().toLowerCase() || 'active';
  const dashboardUrl = `${resolveSiteUrl()}/store/dashboard`;

  return sendZeptoMail({
    to: recipient,
    subject: `Store access updated: ${storeName || 'Store'}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>Your access for <strong>${safeStoreName}</strong> was updated.</p>` +
      `<p><strong>Role:</strong> ${escapeHtml(safeRole)}<br/><strong>Status:</strong> ${escapeHtml(safeStatus)}</p>` +
      `<p>Dashboard: <a href="${dashboardUrl}">${dashboardUrl}</a></p>`,
    text:
      `Hello ${displayName},\n\n` +
      `Your access for ${storeName || 'your store'} was updated.\n` +
      `Role: ${safeRole}\nStatus: ${safeStatus}\n\n` +
      `Dashboard: ${dashboardUrl}`,
  });
}

export async function sendStoreAccessRevokedEmail({
  to,
  recipientName,
  storeName,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const safeStoreName = escapeHtml(storeName || 'the store');

  return sendZeptoMail({
    to: recipient,
    subject: `Store access revoked: ${storeName || 'Store'}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>Your access to <strong>${safeStoreName}</strong> has been revoked.</p>` +
      `<p>If this seems incorrect, contact your store administrator.</p>`,
    text:
      `Hello ${displayName},\n\n` +
      `Your access to ${storeName || 'the store'} has been revoked.\n` +
      `If this seems incorrect, contact your store administrator.`,
  });
}

export async function sendBuyerOrderCompletedEmail({
  to,
  recipientName,
  orderId,
  totalAmount,
  itemCount,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const ordersUrl = `${resolveSiteUrl()}/profile?tab=orders`;

  return sendZeptoMail({
    to: recipient,
    subject: `Order confirmed: ${orderId}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>Your order <strong>${escapeHtml(orderId)}</strong> has been confirmed.</p>` +
      `<p><strong>Items:</strong> ${Number(itemCount || 0)}<br/><strong>Total:</strong> ${escapeHtml(formatCurrency(totalAmount))}</p>` +
      `<p>You can track it here: <a href="${ordersUrl}">${ordersUrl}</a></p>`,
    text:
      `Hello ${displayName},\n\n` +
      `Your order ${orderId} has been confirmed.\n` +
      `Items: ${Number(itemCount || 0)}\nTotal: ${formatCurrency(totalAmount)}\n\n` +
      `Track here: ${ordersUrl}`,
  });
}

export async function sendSellerOrderCompletedEmail({
  to,
  recipientName,
  storeName,
  orderId,
  itemCount,
  subtotal,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const dashboardUrl = `${resolveSiteUrl()}/store/dashboard`;

  return sendZeptoMail({
    to: recipient,
    subject: `New paid order for ${storeName || 'your store'}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>A paid order is ready for fulfillment for <strong>${escapeHtml(storeName || 'your store')}</strong>.</p>` +
      `<p><strong>Order:</strong> ${escapeHtml(orderId)}<br/><strong>Items:</strong> ${Number(itemCount || 0)}<br/><strong>Subtotal:</strong> ${escapeHtml(formatCurrency(subtotal))}</p>` +
      `<p>Open dashboard: <a href="${dashboardUrl}">${dashboardUrl}</a></p>`,
    text:
      `Hello ${displayName},\n\n` +
      `A paid order is ready for fulfillment for ${storeName || 'your store'}.\n` +
      `Order: ${orderId}\nItems: ${Number(itemCount || 0)}\nSubtotal: ${formatCurrency(subtotal)}\n\n` +
      `Dashboard: ${dashboardUrl}`,
  });
}

export async function notifyOrderCompletionEmails({ serviceClient, orderId }) {
  if (!serviceClient || !orderId) {
    return {
      ok: false,
      buyer: { status: 'skipped' },
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: 'Missing serviceClient or orderId',
    };
  }

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, user_id, total_amount, created_at')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order) {
    return {
      ok: false,
      buyer: { status: 'skipped' },
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: orderError?.message || 'Order not found',
    };
  }

  const { data: orderItems, error: orderItemsError } = await serviceClient
    .from('order_items')
    .select('product_id, quantity, price')
    .eq('order_id', orderId);

  if (orderItemsError) {
    return {
      ok: false,
      buyer: { status: 'skipped' },
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: orderItemsError.message,
    };
  }

  const itemCount = (orderItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  let buyerStatus = { status: 'skipped' };
  if (order.user_id) {
    const { data: buyerProfile } = await serviceClient
      .from('users')
      .select('id, full_name, email')
      .eq('id', order.user_id)
      .maybeSingle();

    if (buyerProfile?.email) {
      const buyerMail = await sendBuyerOrderCompletedEmail({
        to: buyerProfile.email,
        recipientName: buyerProfile.full_name,
        orderId: order.id,
        totalAmount: order.total_amount,
        itemCount,
      });
      buyerStatus = {
        status: buyerMail.ok ? 'sent' : 'failed',
        email: buyerProfile.email,
        error: buyerMail.ok ? null : buyerMail.error || 'Failed to send buyer email',
      };
    }
  }

  const productIds = [...new Set((orderItems || []).map((item) => item.product_id).filter(Boolean))];
  if (productIds.length === 0) {
    return {
      ok: true,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
    };
  }

  const { data: products, error: productsError } = await serviceClient
    .from('products')
    .select('id, name, store_id')
    .in('id', productIds);

  if (productsError) {
    return {
      ok: false,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: productsError.message,
    };
  }

  const productById = new Map((products || []).map((product) => [product.id, product]));

  const storeIds = [
    ...new Set(
      (products || [])
        .map((product) => product.store_id)
        .filter(Boolean)
    ),
  ];

  if (storeIds.length === 0) {
    return {
      ok: true,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
    };
  }

  const { data: stores, error: storesError } = await serviceClient
    .from('stores')
    .select('id, name')
    .in('id', storeIds);

  if (storesError) {
    return {
      ok: false,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: storesError.message,
    };
  }

  const storeById = new Map((stores || []).map((store) => [store.id, store]));

  const storeSummaries = new Map();
  for (const item of orderItems || []) {
    const product = productById.get(item.product_id);
    const storeId = product?.store_id;
    if (!storeId) continue;

    const current = storeSummaries.get(storeId) || {
      itemCount: 0,
      subtotal: 0,
      storeName: storeById.get(storeId)?.name || 'Store',
    };

    const qty = Number(item.quantity || 0);
    const linePrice = Number(item.price || 0);
    current.itemCount += qty;
    current.subtotal += qty * linePrice;

    storeSummaries.set(storeId, current);
  }

  const { data: memberships, error: membershipError } = await serviceClient
    .from('store_users')
    .select('store_id, user_id, role, status')
    .in('store_id', storeIds)
    .in('role', ['owner', 'manager'])
    .eq('status', 'active');

  if (membershipError) {
    return {
      ok: false,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: membershipError.message,
    };
  }

  const memberUserIds = [...new Set((memberships || []).map((row) => row.user_id).filter(Boolean))];
  if (memberUserIds.length === 0) {
    return {
      ok: true,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
    };
  }

  const { data: memberProfiles, error: memberProfilesError } = await serviceClient
    .from('users')
    .select('id, full_name, email')
    .in('id', memberUserIds);

  if (memberProfilesError) {
    return {
      ok: false,
      buyer: buyerStatus,
      sellers: { sent: 0, failed: 0, skipped: 0 },
      error: memberProfilesError.message,
    };
  }

  const memberById = new Map((memberProfiles || []).map((row) => [row.id, row]));
  const sentKey = new Set();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  const mailJobs = [];

  for (const membership of memberships || []) {
    const profile = memberById.get(membership.user_id);
    const summary = storeSummaries.get(membership.store_id);

    if (!profile?.email || !summary) {
      skipped += 1;
      continue;
    }

    const key = `${membership.store_id}:${profile.email}`;
    if (sentKey.has(key)) {
      continue;
    }
    sentKey.add(key);

    mailJobs.push(
      sendSellerOrderCompletedEmail({
        to: profile.email,
        recipientName: profile.full_name,
        storeName: summary.storeName,
        orderId: order.id,
        itemCount: summary.itemCount,
        subtotal: summary.subtotal,
      })
    );
  }

  const results = await Promise.allSettled(mailJobs);
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value?.ok) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return {
    ok: true,
    buyer: buyerStatus,
    sellers: { sent, failed, skipped },
  };
}

export async function sendStoreInvitationEmail({
  to,
  recipientName,
  storeName,
  role,
  invitedByName,
  setupLink,
  existingAccount = false,
  inviteMessage = '',
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const actorName = safeName(invitedByName, 'a store administrator');
  const dashboardUrl = `${resolveSiteUrl()}/store/dashboard`;
  const inviteNote = String(inviteMessage || '').trim();
  const messageHtml = inviteNote ? `<p><strong>Message from ${escapeHtml(actorName)}:</strong> ${escapeHtml(inviteNote)}</p>` : '';
  const messageText = inviteNote ? `\n\nMessage from ${actorName}: ${inviteNote}` : '';

  return sendZeptoMail({
    to: recipient,
    subject: `Invitation to join ${storeName || 'a store'} as ${roleLabel(role)}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>${escapeHtml(actorName)} invited you to join <strong>${escapeHtml(storeName || 'their store')}</strong> as <strong>${escapeHtml(roleLabel(role))}</strong>.</p>` +
      messageHtml +
      (existingAccount
        ? `<p>Sign in to accept access automatically: <a href="${dashboardUrl}">${dashboardUrl}</a></p>`
        : `<p>Use this secure link to set up your account and accept the invitation:</p><p><a href="${setupLink}">${setupLink}</a></p>`) +
      `<p>If you were not expecting this invite, you can ignore this email.</p>`,
    text:
      `Hello ${displayName},\n\n` +
      `${actorName} invited you to join ${storeName || 'their store'} as ${roleLabel(role)}.` +
      messageText +
      `\n\n` +
      (existingAccount
        ? `Sign in here: ${dashboardUrl}`
        : `Use this secure setup link to accept: ${setupLink}`),
  });
}

export async function sendReturnRequestStatusEmail({
  to,
  recipientName,
  orderId,
  status,
  refundStatus,
  note,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const ordersUrl = `${resolveSiteUrl()}/profile?tab=orders`;

  return sendZeptoMail({
    to: recipient,
    subject: `Return update for order ${orderId}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>Your return request for <strong>${escapeHtml(orderId)}</strong> was updated.</p>` +
      `<p><strong>Return status:</strong> ${escapeHtml(String(status || 'pending'))}<br/><strong>Refund status:</strong> ${escapeHtml(String(refundStatus || 'not_requested'))}</p>` +
      (note ? `<p><strong>Note:</strong> ${escapeHtml(note)}</p>` : '') +
      `<p>Track the latest details here: <a href="${ordersUrl}">${ordersUrl}</a></p>`,
    text:
      `Hello ${displayName},\n\n` +
      `Your return request for order ${orderId} was updated.\n` +
      `Return status: ${status || 'pending'}\nRefund status: ${refundStatus || 'not_requested'}` +
      (note ? `\nNote: ${note}` : '') +
      `\n\nTrack here: ${ordersUrl}`,
  });
}

export async function sendPayoutExceptionEmail({
  to,
  recipientName,
  storeName,
  summary,
  category,
}) {
  const recipient = normalizeEmail(to);
  if (!recipient) {
    return { ok: false, status: 400, error: 'Missing recipient email' };
  }

  const displayName = safeName(recipientName);
  const payoutsUrl = `${resolveSiteUrl()}/store/dashboard/payouts`;

  return sendZeptoMail({
    to: recipient,
    subject: `Payout exception logged for ${storeName || 'your store'}`,
    html:
      `<p>Hello ${escapeHtml(displayName)},</p>` +
      `<p>A payout operations exception was logged for <strong>${escapeHtml(storeName || 'your store')}</strong>.</p>` +
      `<p><strong>Category:</strong> ${escapeHtml(category || 'general')}<br/><strong>Summary:</strong> ${escapeHtml(summary || 'An issue needs attention')}</p>` +
      `<p>Review it here: <a href="${payoutsUrl}">${payoutsUrl}</a></p>`,
    text:
      `Hello ${displayName},\n\n` +
      `A payout exception was logged for ${storeName || 'your store'}.\n` +
      `Category: ${category || 'general'}\nSummary: ${summary || 'An issue needs attention'}\n\n` +
      `Review it here: ${payoutsUrl}`,
  });
}
