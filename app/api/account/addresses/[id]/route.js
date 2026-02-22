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

export async function PATCH(request, { params }) {
  try {
    const authResult = await getAuthenticatedUser();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, authClient } = authResult;
    const { id } = await params;
    const body = await request.json();

    const { data: existing, error: existingError } = await authClient
      .from('user_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const nextAddressLine1 = sanitizeOptionalText(body?.address, 200) ?? existing.address_line1;
    const nextCity = sanitizeOptionalText(body?.city, 100) ?? existing.city;
    const nextState = sanitizeOptionalText(body?.state, 100) ?? existing.state;
    const nextPhone = sanitizeOptionalText(body?.phone, 32) ?? existing.phone;

    if (!nextAddressLine1 || !nextCity || !nextState || !nextPhone) {
      return NextResponse.json(
        { error: 'Address, city, state, and phone are required' },
        { status: 400 }
      );
    }

    const nextIsDefault =
      body?.isDefault === undefined ? Boolean(existing.is_default) : Boolean(body?.isDefault);

    if (nextIsDefault) {
      const { error: unsetError } = await authClient
        .from('user_addresses')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', id);

      if (unsetError) {
        return NextResponse.json({ error: unsetError.message }, { status: 500 });
      }
    }

    const { data: updated, error: updateError } = await authClient
      .from('user_addresses')
      .update({
        label: sanitizeOptionalText(body?.type, 40) ?? existing.label,
        address_line1: nextAddressLine1,
        address_line2: sanitizeOptionalText(body?.addressLine2, 200) ?? existing.address_line2,
        city: nextCity,
        state: nextState,
        postal_code: sanitizeOptionalText(body?.postalCode, 20) ?? existing.postal_code,
        country: sanitizeOptionalText(body?.country, 100) ?? existing.country,
        phone: nextPhone,
        is_default: nextIsDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: mapAddressRow(updated),
    });
  } catch (error) {
    console.error('Address PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await getAuthenticatedUser();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, authClient } = authResult;
    const { id } = await params;

    const { data: existing, error: existingError } = await authClient
      .from('user_addresses')
      .select('id, is_default')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const { error: deleteError } = await authClient
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (existing.is_default) {
      const { data: fallback } = await authClient
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (fallback?.id) {
        await authClient
          .from('user_addresses')
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq('id', fallback.id)
          .eq('user_id', user.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
