function toMoney(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Number(numeric.toFixed(2));
}

function buildReleaseReference(orderId, storeId) {
  const orderPart = String(orderId || '').slice(0, 8) || 'order';
  const storePart = String(storeId || '').slice(0, 8) || 'store';
  const ts = Date.now();
  return `escrow_rel_${orderPart}_${storePart}_${ts}`;
}

export async function ensureEscrowFundedForOrder({ serviceClient, orderId }) {
  if (!serviceClient || !orderId) {
    return { ok: false, error: 'Missing serviceClient or orderId' };
  }

  const { data: existingHolds, error: existingError } = await serviceClient
    .from('escrow_transactions')
    .select('id, store_id, amount')
    .eq('order_id', orderId)
    .eq('transaction_type', 'hold')
    .eq('status', 'recorded');

  if (!existingError && Array.isArray(existingHolds) && existingHolds.length > 0) {
    await serviceClient
      .from('orders')
      .update({
        escrow_status: 'funded',
        escrow_funded_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .neq('escrow_status', 'released');

    const total = existingHolds.reduce((sum, row) => sum + toMoney(row.amount), 0);
    return {
      ok: true,
      created: false,
      holdCount: existingHolds.length,
      total,
    };
  }

  const { data: orderItems, error: itemsError } = await serviceClient
    .from('order_items')
    .select('product_id, quantity, price')
    .eq('order_id', orderId);

  if (itemsError) {
    return { ok: false, error: itemsError.message };
  }

  const productIds = [...new Set((orderItems || []).map((item) => item.product_id).filter(Boolean))];
  if (productIds.length === 0) {
    return { ok: false, error: 'No order items found for escrow funding' };
  }

  const { data: products, error: productsError } = await serviceClient
    .from('products')
    .select('id, store_id')
    .in('id', productIds);

  if (productsError) {
    return { ok: false, error: productsError.message };
  }

  const productStoreMap = new Map((products || []).map((p) => [p.id, p.store_id]));
  const holdByStore = new Map();

  for (const item of orderItems || []) {
    const storeId = productStoreMap.get(item.product_id);
    if (!storeId) continue;

    const lineAmount = toMoney(Number(item.quantity || 0) * Number(item.price || 0));
    holdByStore.set(storeId, toMoney((holdByStore.get(storeId) || 0) + lineAmount));
  }

  if (holdByStore.size === 0) {
    return { ok: false, error: 'No store allocations could be computed for escrow' };
  }

  const rows = [];
  for (const [storeId, amount] of holdByStore.entries()) {
    rows.push({
      order_id: orderId,
      store_id: storeId,
      transaction_type: 'hold',
      amount,
      currency: 'NGN',
      status: 'recorded',
      metadata: {
        source: 'payment_success',
      },
    });
  }

  const { error: insertError } = await serviceClient
    .from('escrow_transactions')
    .insert(rows);

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  await serviceClient
    .from('orders')
    .update({
      escrow_status: 'funded',
      escrow_funded_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return {
    ok: true,
    created: true,
    holdCount: rows.length,
    total: rows.reduce((sum, row) => sum + toMoney(row.amount), 0),
  };
}

export async function releaseEscrowForOrderStore({
  serviceClient,
  orderId,
  storeId,
  approvedBy,
  mode = 'manual',
}) {
  if (!serviceClient || !orderId || !storeId) {
    return { ok: false, error: 'Missing required release inputs' };
  }

  const { data: existingPayout, error: payoutLookupError } = await serviceClient
    .from('store_payouts')
    .select('id, status, paystack_reference, amount')
    .eq('order_id', orderId)
    .eq('store_id', storeId)
    .in('status', ['queued', 'pending_gateway', 'released'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (payoutLookupError) {
    return { ok: false, error: payoutLookupError.message };
  }

  if (existingPayout?.id) {
    return {
      ok: true,
      created: false,
      payout: existingPayout,
    };
  }

  const { data: holdTx, error: holdError } = await serviceClient
    .from('escrow_transactions')
    .select('id, amount, status')
    .eq('order_id', orderId)
    .eq('store_id', storeId)
    .eq('transaction_type', 'hold')
    .eq('status', 'recorded')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (holdError) {
    return { ok: false, error: holdError.message };
  }

  if (!holdTx?.id) {
    return { ok: false, error: 'No escrow hold found for this order/store' };
  }

  const reference = buildReleaseReference(orderId, storeId);
  const nowIso = new Date().toISOString();

  const { data: payoutRows, error: payoutInsertError } = await serviceClient
    .from('store_payouts')
    .insert({
      order_id: orderId,
      store_id: storeId,
      escrow_transaction_id: holdTx.id,
      amount: holdTx.amount,
      status: 'queued',
      paystack_reference: reference,
      approved_by: approvedBy || null,
      metadata: {
        mode,
      },
    })
    .select('id, order_id, store_id, amount, status, paystack_reference, created_at');

  if (payoutInsertError) {
    return { ok: false, error: payoutInsertError.message };
  }

  const { error: escrowUpdateError } = await serviceClient
    .from('escrow_transactions')
    .update({
      status: 'released',
      approved_by: approvedBy || null,
      metadata: {
        mode,
        released_at: nowIso,
      },
    })
    .eq('id', holdTx.id);

  if (escrowUpdateError) {
    return { ok: false, error: escrowUpdateError.message };
  }

  const { error: orderUpdateError } = await serviceClient
    .from('orders')
    .update({
      escrow_status: 'released',
      escrow_released_at: nowIso,
      release_approved_by: approvedBy || null,
    })
    .eq('id', orderId)
    .neq('escrow_status', 'released');

  if (orderUpdateError) {
    return { ok: false, error: orderUpdateError.message };
  }

  return {
    ok: true,
    created: true,
    payout: payoutRows?.[0] || null,
  };
}
