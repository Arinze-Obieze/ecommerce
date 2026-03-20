import { NextResponse } from 'next/server';
import { requireAdminApi, ADMIN_ROLES } from '@/utils/adminAuth';
import { enforceRateLimit } from '@/utils/rateLimit';
import { releaseEscrowForOrderStore } from '@/utils/escrow';

function toMoney(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : 0;
}

async function initiatePaystackTransfer({ amount, reference, recipientCode, reason }) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
  if (!paystackSecret) {
    return { ok: false, error: 'Missing Paystack secret for transfers' };
  }

  const payload = {
    source: 'balance',
    amount: Math.round(toMoney(amount) * 100),
    recipient: recipientCode,
    reason: reason || 'Escrow release',
    reference,
  };

  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.status) {
    return {
      ok: false,
      error: data?.message || 'Failed to initiate transfer',
      data,
    };
  }

  return {
    ok: true,
    data: data.data || null,
  };
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
  const status = String(searchParams.get('status') || 'queued').trim().toLowerCase();

  if (status === 'released') {
    const { data: payouts, error } = await admin.adminClient
      .from('store_payouts')
      .select('id, order_id, store_id, amount, status, paystack_reference, paystack_transfer_code, failure_reason, created_at, released_at, stores(id, name), orders(id, status, fulfillment_status, escrow_status)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: payouts || [] });
  }

  const { data: holds, error } = await admin.adminClient
    .from('escrow_transactions')
    .select('id, order_id, store_id, amount, status, created_at, stores(id, name), orders(id, status, fulfillment_status, escrow_status, created_at), store_payouts(id, status, paystack_reference)')
    .eq('transaction_type', 'hold')
    .eq('status', 'recorded')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: holds || [] });
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

  if (releaseNow && payout?.id) {
    const { data: payoutAccount, error: payoutAccountError } = await admin.adminClient
      .from('store_payout_accounts')
      .select('id, recipient_code, is_verified, is_active, bank_code, account_number')
      .eq('store_id', storeId)
      .maybeSingle();

    if (payoutAccountError) {
      return NextResponse.json({ error: payoutAccountError.message }, { status: 500 });
    }

    if (!payoutAccount?.recipient_code) {
      await admin.adminClient
        .from('store_payouts')
        .update({
          status: 'failed',
          failure_reason: 'Store payout account has no recipient_code',
        })
        .eq('id', payout.id);

      return NextResponse.json(
        {
          error: 'Payout account incomplete: recipient_code missing',
          data: { payoutId: payout.id },
        },
        { status: 409 }
      );
    }

    const transferResult = await initiatePaystackTransfer({
      amount: payout.amount,
      reference: payout.paystack_reference,
      recipientCode: payoutAccount.recipient_code,
      reason: `Escrow release for order ${orderId}`,
    });

    if (!transferResult.ok) {
      await admin.adminClient
        .from('store_payouts')
        .update({
          status: 'failed',
          failure_reason: transferResult.error,
        })
        .eq('id', payout.id);

      return NextResponse.json(
        {
          error: transferResult.error || 'Transfer failed',
          details: transferResult.data || null,
          data: { payoutId: payout.id },
        },
        { status: 502 }
      );
    }

    const transferData = transferResult.data || {};

    const { data: payoutRows, error: payoutUpdateError } = await admin.adminClient
      .from('store_payouts')
      .update({
        status: 'pending_gateway',
        paystack_transfer_code: transferData.transfer_code || null,
        metadata: {
          gateway_status: transferData.status || null,
          initiated_at: new Date().toISOString(),
        },
      })
      .eq('id', payout.id)
      .select('id, order_id, store_id, amount, status, paystack_reference, paystack_transfer_code, created_at');

    if (payoutUpdateError) {
      return NextResponse.json({ error: payoutUpdateError.message }, { status: 500 });
    }

    payout = payoutRows?.[0] || payout;
  }

  return NextResponse.json({ success: true, data: payout });
}
