const PAYSTACK_API_BASE = 'https://api.paystack.co';
const BANK_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

let cachedBanks = {
  expiresAt: 0,
  items: null,
};

function getPaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing Paystack secret');
  }
  return secret;
}

async function paystackRequest(path, { method = 'GET', body } = {}) {
  const secret = getPaystackSecret();
  const response = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.status === false) {
    const message = payload?.message || `Paystack request failed (${response.status})`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? null;
}

function normalizeBankItem(bank) {
  return {
    name: String(bank?.name || '').trim(),
    code: String(bank?.code || '').trim(),
    slug: String(bank?.slug || '').trim(),
    active: Boolean(bank?.active ?? true),
  };
}

export async function listPaystackBanks({ country = 'nigeria', currency = 'NGN', forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedBanks.items && cachedBanks.expiresAt > now) {
    return cachedBanks.items;
  }

  const params = new URLSearchParams({
    country,
    currency,
    use_cursor: 'false',
    perPage: '100',
  });
  const data = await paystackRequest(`/bank?${params.toString()}`);
  const items = Array.isArray(data)
    ? data.map(normalizeBankItem).filter((item) => item.name && item.code && item.active)
    : [];

  items.sort((a, b) => a.name.localeCompare(b.name));
  cachedBanks = {
    items,
    expiresAt: now + BANK_CACHE_TTL_MS,
  };

  return items;
}

export async function resolvePaystackAccount({ accountNumber, bankCode }) {
  const params = new URLSearchParams({
    account_number: String(accountNumber || '').trim(),
    bank_code: String(bankCode || '').trim(),
  });
  const data = await paystackRequest(`/bank/resolve?${params.toString()}`);

  return {
    accountName: String(data?.account_name || '').trim(),
    accountNumber: String(data?.account_number || '').trim(),
    bankId: String(data?.bank_id || '').trim(),
  };
}

export async function createPaystackTransferRecipient({ accountName, accountNumber, bankCode, currency = 'NGN' }) {
  const data = await paystackRequest('/transferrecipient', {
    method: 'POST',
    body: {
      type: 'nuban',
      name: String(accountName || '').trim(),
      account_number: String(accountNumber || '').trim(),
      bank_code: String(bankCode || '').trim(),
      currency,
    },
  });

  return {
    active: Boolean(data?.active ?? true),
    recipientCode: String(data?.recipient_code || '').trim(),
    recipientId: String(data?.id || '').trim(),
    details: data || null,
  };
}

export async function initiatePaystackTransfer({ amount, reference, recipientCode, reason }) {
  const numericAmount = Number(amount || 0);
  const koboAmount = Number.isFinite(numericAmount) ? Math.round(numericAmount * 100) : 0;
  const data = await paystackRequest('/transfer', {
    method: 'POST',
    body: {
      source: 'balance',
      amount: koboAmount,
      recipient: String(recipientCode || '').trim(),
      reason: reason || 'Escrow release',
      reference: String(reference || '').trim(),
    },
  });

  return data || null;
}
