import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/store/auth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/platform/rate-limit';
import {
  createPaystackTransferRecipient,
  listPaystackBanks,
  resolvePaystackAccount,
} from '@/utils/payments/paystack-transfers';

function normalizeAccountNumber(value) {
  return String(value || '').replace(/\D+/g, '').trim();
}

function normalizeBankCode(value) {
  return String(value || '').trim();
}

function money(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
}

function normalizePayoutStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'pending_gateway') return 'processing';
  if (status === 'released') return 'success';
  return status;
}

export async function GET(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_read',
    identifier: ctx.user.id,
    limit: 120,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const storeId = ctx.membership.store_id;
  const bankOptionsPromise = listPaystackBanks().catch(() => []);

  const [accountRes, payoutsRes, escrowRes, bankOptions] = await Promise.all([
    ctx.adminClient
      .from('store_payout_accounts')
      .select('id, store_id, account_name, account_number, bank_code, bank_name, recipient_code, is_verified, is_active, verified_at, updated_at, recipient_status, verification_error, last_verified_at')
      .eq('store_id', storeId)
      .maybeSingle(),
    ctx.adminClient
      .from('store_payouts')
      .select('id, order_id, amount, status, paystack_reference, paystack_transfer_code, failure_reason, created_at, released_at, metadata')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(200),
    ctx.adminClient
      .from('escrow_transactions')
      .select('id, order_id, amount, transaction_type, status, created_at, orders(id, fulfillment_status, escrow_status, status, created_at), store_payouts(id, status, paystack_reference, created_at)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(500),
    bankOptionsPromise,
  ]);

  if (accountRes.error || payoutsRes.error || escrowRes.error) {
    return NextResponse.json({ error: accountRes.error?.message || payoutsRes.error?.message || escrowRes.error?.message }, { status: 500 });
  }

  const payoutRows = (payoutsRes.data || []).map((row) => ({
    ...row,
    normalized_status: normalizePayoutStatus(row.status),
  }));

  const escrowRows = (escrowRes.data || [])
    .filter((row) => row.transaction_type === 'hold')
    .map((row) => {
      const relatedPayout = Array.isArray(row.store_payouts) ? row.store_payouts[0] || null : row.store_payouts || null;
      const order = Array.isArray(row.orders) ? row.orders[0] || null : row.orders || null;
      const payoutStatus = normalizePayoutStatus(relatedPayout?.status);
      const fulfillmentStatus = String(order?.fulfillment_status || '').toLowerCase();
      const isPaid = payoutStatus === 'success' || row.status === 'released';
      const isProcessing = ['queued', 'processing'].includes(payoutStatus);
      const isEligible = !isPaid && !isProcessing && fulfillmentStatus === 'delivered_confirmed';

      return {
        ...row,
        order,
        relatedPayout,
        seller_view_status: isPaid
          ? 'paid'
          : isProcessing
            ? payoutStatus
            : isEligible
              ? 'eligible'
              : 'held',
      };
    });

  const summary = {
    totalEscrowHeld: money(
      escrowRows
        .filter((row) => row.status === 'recorded')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    availableForRelease: money(
      escrowRows
        .filter((row) => row.seller_view_status === 'eligible')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    payoutsQueued: money(
      payoutRows
        .filter((row) => row.normalized_status === 'queued')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    payoutsProcessing: money(
      payoutRows
        .filter((row) => row.normalized_status === 'processing')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    totalPaidOut: money(
      payoutRows
        .filter((row) => row.normalized_status === 'success')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    failedPayouts: money(
      payoutRows
        .filter((row) => row.normalized_status === 'failed')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0)
    ),
    totalPayoutRecords: payoutRows.length,
    pendingEscrowItems: escrowRows.filter((row) => ['held', 'eligible'].includes(row.seller_view_status)).length,
  };

  return NextResponse.json({
    success: true,
    data: {
      payoutAccount: accountRes.data || null,
      payouts: payoutRows,
      escrowItems: escrowRows,
      bankOptions,
      summary,
    },
  });
}

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_write',
    identifier: ctx.user.id,
    limit: 30,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const accountNumber = normalizeAccountNumber(body?.account_number);
  const bankCode = normalizeBankCode(body?.bank_code);
  const requestedBankName = String(body?.bank_name || '').trim();

  if (!accountNumber || accountNumber.length < 10) {
    return NextResponse.json({ error: 'Valid account number is required' }, { status: 400 });
  }

  if (!bankCode) {
    return NextResponse.json({ error: 'Bank code is required' }, { status: 400 });
  }

  let banks = [];
  try {
    banks = await listPaystackBanks();
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load supported banks' }, { status: 502 });
  }

  const selectedBank = banks.find((bank) => bank.code === bankCode);
  if (!selectedBank) {
    return NextResponse.json({ error: 'Selected bank is not supported' }, { status: 400 });
  }

  let resolution;
  try {
    resolution = await resolvePaystackAccount({
      accountNumber,
      bankCode,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to verify bank account' }, { status: 502 });
  }

  if (!resolution?.accountName) {
    return NextResponse.json({ error: 'Could not resolve account name for this bank account' }, { status: 400 });
  }

  let recipient;
  try {
    recipient = await createPaystackTransferRecipient({
      accountName: resolution.accountName,
      accountNumber,
      bankCode,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to create transfer recipient' }, { status: 502 });
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await ctx.adminClient
    .from('store_payout_accounts')
    .upsert(
      {
        store_id: ctx.membership.store_id,
        account_name: resolution.accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: selectedBank.name || requestedBankName || null,
        recipient_code: recipient.recipientCode || null,
        is_verified: Boolean(recipient.recipientCode),
        is_active: Boolean(recipient.active ?? true),
        verified_at: recipient.recipientCode ? nowIso : null,
        recipient_status: recipient.recipientCode ? 'recipient_created' : 'unverified',
        verification_error: null,
        last_verified_at: nowIso,
        updated_at: nowIso,
        created_by: ctx.user.id,
        updated_by: ctx.user.id,
      },
      { onConflict: 'store_id' }
    )
    .select('id, store_id, account_name, account_number, bank_code, bank_name, recipient_code, is_verified, is_active, verified_at, updated_at, recipient_status, verification_error, last_verified_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
