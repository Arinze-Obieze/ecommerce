import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';

function sanitizeOptionalText(value, maxLength = 255) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

function mapAddressRow(row) {
  return {
    id: row.id,
    type: row.label || 'Address',
    address: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAuthenticatedUser() {
  const authClient = await createServerClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return { error: 'Authentication required', status: 401 };
  }

  return { user, authClient };
}

export async function GET() {
  try {
    const authResult = await getAuthenticatedUser();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, authClient } = authResult;

    const { data, error } = await authClient
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map(mapAddressRow),
    });
  } catch (error) {
    console.error('Address GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authResult = await getAuthenticatedUser();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, authClient } = authResult;
    const body = await request.json();

    const label = sanitizeOptionalText(body?.type, 40) || 'Address';
    const addressLine1 = sanitizeOptionalText(body?.address, 200);
    const addressLine2 = sanitizeOptionalText(body?.addressLine2, 200);
    const city = sanitizeOptionalText(body?.city, 100);
    const state = sanitizeOptionalText(body?.state, 100);
    const postalCode = sanitizeOptionalText(body?.postalCode, 20);
    const country = sanitizeOptionalText(body?.country, 100) || 'Nigeria';
    const phone = sanitizeOptionalText(body?.phone, 32);
    const requestedDefault = Boolean(body?.isDefault);

    if (!addressLine1 || !city || !state || !phone) {
      return NextResponse.json(
        { error: 'Address, city, state, and phone are required' },
        { status: 400 }
      );
    }

    const { count, error: countError } = await authClient
      .from('user_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const isDefault = requestedDefault || Number(count || 0) === 0;

    if (isDefault) {
      const { error: unsetError } = await authClient
        .from('user_addresses')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_default', true);

      if (unsetError) {
        return NextResponse.json({ error: unsetError.message }, { status: 500 });
      }
    }

    const { data, error } = await authClient
      .from('user_addresses')
      .insert({
        user_id: user.id,
        label,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        phone,
        is_default: isDefault,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: mapAddressRow(data),
    });
  } catch (error) {
    console.error('Address POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
