import { NextResponse } from 'next/server';
import { requireStoreApi, STORE_ROLES } from '@/utils/storeAuth';
import { enforceRateLimit, rateLimitPayload, rateLimitHeaders } from '@/utils/rateLimit';
import { listPaystackBanks, resolvePaystackAccount } from '@/utils/paystackTransfers';

function normalizeAccountNumber(value) {
  return String(value || '').replace(/\D+/g, '').trim();
}

function normalizeBankCode(value) {
  return String(value || '').trim();
}

export async function POST(request) {
  const ctx = await requireStoreApi([STORE_ROLES.OWNER, STORE_ROLES.MANAGER, STORE_ROLES.STAFF]);
  if (!ctx.ok) return ctx.response;

  const rateLimit = await enforceRateLimit({
    request,
    scope: 'store_payouts_resolve',
    identifier: ctx.user.id,
    limit: 40,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(rateLimitPayload('Too many requests. Please wait a moment and try again.', rateLimit), { status: 429, headers: rateLimitHeaders(rateLimit) });
  }

  const body = await request.json().catch(() => ({}));
  const accountNumber = normalizeAccountNumber(body?.account_number);
  const bankCode = normalizeBankCode(body?.bank_code);

  if (!accountNumber || accountNumber.length < 10 || !bankCode) {
    return NextResponse.json({ error: 'Bank and valid account number are required' }, { status: 400 });
  }

  let bankOptions = [];
  try {
    bankOptions = await listPaystackBanks();
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load supported banks' }, { status: 502 });
  }

  const bank = bankOptions.find((item) => item.code === bankCode);
  if (!bank) {
    return NextResponse.json({ error: 'Selected bank is not supported' }, { status: 400 });
  }

  try {
    const resolution = await resolvePaystackAccount({ accountNumber, bankCode });
    return NextResponse.json({
      success: true,
      data: {
        account_name: resolution.accountName,
        account_number: resolution.accountNumber || accountNumber,
        bank_code: bankCode,
        bank_name: bank.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to verify bank account' }, { status: 502 });
  }
}
