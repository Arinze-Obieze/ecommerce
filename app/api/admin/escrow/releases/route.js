import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { releaseEscrowForOrderStore } from '@/utils/escrow';
import { initiatePaystackTransfer } from '@/utils/paystackTransfers';

function toMoney(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
}

function normalizePayoutStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'pending_gateway') return 'processing';
  if (value === 'released') return 'success';
  return value;
}

function normalizeHoldRow(row, payoutAccount) {
  const store = Array.isArray(row?.stores) ? row.stores[0] || null : row?.stores || null;
  const order = Array.isArray(row?.orders) ? row.orders[0] || null : row?.orders || null;
  const payout = Array.isArray(row?.store_payouts) ? row.store_payouts[0] || null : row?.store_payouts || null;
  const payoutStatus = normalizePayoutStatus(payout?.status);
  const fulfillmentStatus = String(order?.fulfillment_status || '').toLowerCase();
  const readyForRelease = row?.status === 'recorded' && fulfillmentStatus === 'delivered_confirmed' && !payout?.id;

  return {
    id: row.id,
    kind: 'escrow',
    order_id: row.order_id,
    store_id: row.store_id,
    amount: toMoney(row.amount),
    created_at: row.created_at,
    escrow_status: row.status,
    payout_status: payoutStatus || null,
    payout_reference: payout?.paystack_reference || null,
    recipient_ready: Boolean(payoutAccount?.recipient_code && payoutAccount?.is_active),
    payout_account_status: payoutAccount?.recipient_status || (payoutAccount?.recipient_code ? 'recipient_created' : 'missing'),
    ready_for_release: readyForRelease,
    stores: store,
    orders: order,
  };
}

function normalizePayoutRow(row, payoutAccount) {
  const store = Array.isArray(row?.stores) ? row.stores[0] || null : row?.stores || null;
  const order = Array.isArray(row?.orders) ? row.orders[0] || null : row?.orders || null;

  return {
    id: row.id,
    kind: 'payout',
    order_id: row.order_id,
    store_id: row.store_id,
    amount: toMoney(row.amount),
    created_at: row.created_at,
    released_at: row.released_at,
    payout_status: normalizePayoutStatus(row.status),
    failure_reason: row.failure_reason || null,
    paystack_reference: row.paystack_reference || null,
    paystack_transfer_code: row.paystack_transfer_code || null,
    recipient_ready: Boolean(payoutAccount?.recipient_code && payoutAccount?.is_active),
    payout_account_status: payoutAccount?.recipient_status || (payoutAccount?.recipient_code ? 'recipient_created' : 'missing'),
    stores: store,
    orders: order,
  };
}

function buildSummary(holds, payouts) {
  const readyRows = holds.filter((row) => row.ready_for_release);
  const queuedRows = payouts.filter((row) => row.payout_status === 'queued');
  const processingRows = payouts.filter((row) => row.payout_status === 'processing');
  const paidRows = payouts.filter((row) => row.payout_status === 'success');
  const failedRows = payouts.filter((row) => row.payout_status === 'failed');
  const blockedStoreIds = new Set(
    holds.filter((row) => row.ready_for_release && !row.recipient_ready).map((row) => row.store_id)
  );

  return {
    totalEscrowHeld: toMoney(holds.filter((row) => row.escrow_status === 'recorded').reduce((sum, row) => sum + row.amount, 0)),
    readyForRelease: toMoney(readyRows.reduce((sum, row) => sum + row.amount, 0)),
    queuedAmount: toMoney(queuedRows.reduce((sum, row) => sum + row.amount, 0)),
    processingAmount: toMoney(processingRows.reduce((sum, row) => sum + row.amount, 0)),
    paidAmount: toMoney(paidRows.reduce((sum, row) => sum + row.amount, 0)),
    failedAmount: toMoney(failedRows.reduce((sum, row) => sum + row.amount, 0)),
    sellersBlocked: blockedStoreIds.size,
  };
}

function filterRowsByStatus(status, holds, payouts) {
  switch (status) {
    case 'queued':
      return payouts.filter((row) => row.payout_status === 'queued');
    case 'processing':
      return payouts.filter((row) => row.payout_status === 'processing');
    case 'paid':
      return payouts.filter((row) => row.payout_status === 'success');
    case 'failed':
      return payouts.filter((row) => row.payout_status === 'failed');
    case 'held':
      return holds.filter((row) => row.escrow_status === 'recorded' && !row.ready_for_release);
    case 'ready':
    default:
      return holds.filter((row) => row.ready_for_release);
  }
}

export async function GET(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_escrow_read',
    identifier: admin.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const status = String(searchParams.get('status') || 'ready').trim().toLowerCase();

  const [holdsRes, payoutsRes, payoutAccountsRes] = await Promise.all([
    admin.adminClient
      .from('escrow_transactions')
      .select('id, order_id, store_id, amount, status, created_at, stores(id, name), orders(id, status, fulfillment_status, escrow_status, created_at), store_payouts(id, status, paystack_reference)')
      .eq('transaction_type', 'hold')
      .order('created_at', { ascending: false })
      .limit(500),
    admin.adminClient
      .from('store_payouts')
      .select('id, order_id, store_id, amount, status, paystack_reference, paystack_transfer_code, failure_reason, created_at, released_at, stores(id, name), orders(id, status, fulfillment_status, escrow_status)')
      .order('created_at', { ascending: false })
      .limit(500),
    admin.adminClient
      .from('store_payout_accounts')
      .select('id, store_id, recipient_code, is_active, recipient_status')
      .limit(500),
  ]);

  if (holdsRes.error || payoutsRes.error || payoutAccountsRes.error) {
    return NextResponse.json({ error: holdsRes.error?.message || payoutsRes.error?.message || payoutAccountsRes.error?.message }, { status: 500 });
  }

  const payoutAccountByStoreId = new Map((payoutAccountsRes.data || []).map((row) => [row.store_id, row]));
  const holds = (holdsRes.data || []).map((row) => normalizeHoldRow(row, payoutAccountByStoreId.get(row.store_id) || null));
  const payouts = (payoutsRes.data || []).map((row) => normalizePayoutRow(row, payoutAccountByStoreId.get(row.store_id) || null));
  const summary = buildSummary(holds, payouts);
  const rows = filterRowsByStatus(status, holds, payouts);

  return NextResponse.json({
    success: true,
    data: {
      status,
      rows,
      summary,
    },
  });
}

export async function POST(request) {
  const admin = await requireAdminApi([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.OPS_ADMIN]);
  if (!admin.ok) return admin.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'admin_escrow_write',
    identifier: admin.user.id,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = String(body?.order_id || '').trim();
  const storeId = String(body?.store_id || '').trim();
  const releaseNow = Boolean(body?.release_now);

  if (!orderId || !storeId) {
    return NextResponse.json({ error: 'order_id and store_id are required' }, { status: 400 });
  }

  const { data: holdRow, error: holdLookupError } = await admin.adminClient
    .from('escrow_transactions')
      .select('id, amount, status, orders(id, fulfillment_status)')
    .eq('order_id', orderId)
    .eq('store_id', storeId)
    .eq('transaction_type', 'hold')
    .eq('status', 'recorded')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (holdLookupError) {
    return NextResponse.json({ error: holdLookupError.message }, { status: 500 });
  }

  let storePayoutAccount = null;
  if (holdRow?.id) {
    const payoutAccountRes = await admin.adminClient
      .from('store_payout_accounts')
      .select('id, store_id, recipient_code, is_active, recipient_status')
      .eq('store_id', storeId)
      .maybeSingle();
    if (payoutAccountRes.error) {
      return NextResponse.json({ error: payoutAccountRes.error.message }, { status: 500 });
    }
    storePayoutAccount = payoutAccountRes.data || null;
  }

  const normalizedHold = holdRow
    ? normalizeHoldRow({
        ...holdRow,
        order_id: orderId,
        store_id: storeId,
      }, storePayoutAccount)
    : null;

  if (!normalizedHold?.id) {
    return NextResponse.json({ error: 'No escrow hold found for this order/store' }, { status: 404 });
  }

  if (!normalizedHold.ready_for_release) {
    return NextResponse.json({ error: 'Escrow is not yet eligible for release' }, { status: 409 });
  }

  const releaseResult = await releaseEscrowForOrderStore({
    serviceClient: admin.adminClient,
    orderId,
    storeId,
    approvedBy: admin.user.id,
    mode: releaseNow ? 'release_now' : 'queue_only',
  });

  if (!releaseResult.ok) {
    return NextResponse.json({ error: releaseResult.error || 'Failed to queue release' }, { status: 400 });
  }

  let payout = releaseResult.payout;

  if (!releaseNow || !payout?.id) {
    return NextResponse.json({ success: true, data: payout });
  }

  const { data: payoutRecipientAccount, error: payoutAccountError } = await admin.adminClient
    .from('store_payout_accounts')
    .select('id, recipient_code, is_verified, is_active, recipient_status, bank_code, account_number')
    .eq('store_id', storeId)
    .maybeSingle();

  if (payoutAccountError) {
    return NextResponse.json({ error: payoutAccountError.message }, { status: 500 });
  }

  if (!payoutRecipientAccount?.recipient_code || !payoutRecipientAccount?.is_active) {
    await admin.adminClient
      .from('store_payouts')
      .update({
        status: 'failed',
        failure_reason: 'Store payout account is not recipient-ready',
      })
      .eq('id', payout.id);

    return NextResponse.json(
      {
        error: 'Payout account incomplete: recipient is missing or inactive',
        data: { payoutId: payout.id },
      },
      { status: 409 }
    );
  }

  let transferData;
  try {
    transferData = await initiatePaystackTransfer({
      amount: payout.amount,
      reference: payout.paystack_reference,
      recipientCode: payoutRecipientAccount.recipient_code,
      reason: `Escrow release for order ${orderId}`,
    });
  } catch (error) {
    await admin.adminClient
      .from('store_payouts')
      .update({
        status: 'failed',
        failure_reason: error.message || 'Transfer failed',
        metadata: {
          gateway_error: error.payload || null,
          failed_at: new Date().toISOString(),
        },
      })
      .eq('id', payout.id);

    return NextResponse.json(
      {
        error: error.message || 'Transfer failed',
        details: error.payload || null,
        data: { payoutId: payout.id },
      },
      { status: 502 }
    );
  }

  const { data: payoutRows, error: payoutUpdateError } = await admin.adminClient
    .from('store_payouts')
    .update({
      status: 'processing',
      paystack_transfer_code: transferData?.transfer_code || null,
      metadata: {
        gateway_status: transferData?.status || null,
        transfer_name: transferData?.transfer_code || null,
        initiated_at: new Date().toISOString(),
      },
    })
    .eq('id', payout.id)
    .select('id, order_id, store_id, amount, status, paystack_reference, paystack_transfer_code, created_at, released_at')
    .single();

  if (payoutUpdateError) {
    return NextResponse.json({ error: payoutUpdateError.message }, { status: 500 });
  }

  payout = payoutRows || payout;
  return NextResponse.json({ success: true, data: payout });
}
