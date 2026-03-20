import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit } from '@/utils/rateLimit';

function normalizeAccountNumber(value) {
  return String(value || '').replace(/\D+/g, '').trim();
}

function normalizeBankCode(value) {
  return String(value || '').trim();
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const storeId = ctx.membership.store_id;

  const [accountRes, payoutsRes, escrowRes] = await Promise.all([
    ctx.adminClient
      .from('store_payout_accounts')
      .select('id, store_id, account_name, account_number, bank_code, bank_name, recipient_code, is_verified, is_active, verified_at, updated_at')
      .eq('store_id', storeId)
      .maybeSingle(),
    ctx.adminClient
      .from('store_payouts')
      .select('id, order_id, amount, status, paystack_reference, paystack_transfer_code, failure_reason, created_at, released_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(200),
    ctx.adminClient
      .from('escrow_transactions')
      .select('id, amount, transaction_type, status, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  if (accountRes.error || payoutsRes.error || escrowRes.error) {
    return NextResponse.json({ error: accountRes.error?.message || payoutsRes.error?.message || escrowRes.error?.message }, { status: 500 });
  }

  const escrowHeld = (escrowRes.data || [])
    .filter((row) => row.transaction_type === 'hold' && row.status === 'recorded')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const escrowReleased = (escrowRes.data || [])
    .filter((row) => row.transaction_type === 'hold' && row.status === 'released')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return NextResponse.json({
    success: true,
    data: {
      payoutAccount: accountRes.data || null,
      payouts: payoutsRes.data || [],
      summary: {
        escrowHeld: Number(escrowHeld.toFixed(2)),
        escrowReleased: Number(escrowReleased.toFixed(2)),
      },
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const accountName = String(body?.account_name || '').trim();
  const accountNumber = normalizeAccountNumber(body?.account_number);
  const bankCode = normalizeBankCode(body?.bank_code);
  const bankName = String(body?.bank_name || '').trim();

  if (!accountNumber || accountNumber.length < 10) {
    return NextResponse.json({ error: 'Valid account number is required' }, { status: 400 });
  }

  if (!bankCode) {
    return NextResponse.json({ error: 'Bank code is required' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await ctx.adminClient
    .from('store_payout_accounts')
    .upsert(
      {
        store_id: ctx.membership.store_id,
        account_name: accountName || null,
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName || null,
        is_verified: false,
        is_active: true,
        updated_at: nowIso,
        updated_by: ctx.user.id,
      },
      { onConflict: 'store_id' }
    )
    .select('id, store_id, account_name, account_number, bank_code, bank_name, recipient_code, is_verified, is_active, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
