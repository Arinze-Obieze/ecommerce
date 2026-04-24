import { NextResponse } from 'next/server';
import {
  createAdminClient,
  createClient as createServerClient,
} from '@/utils/supabase/server';

function sanitizeOptionalText(value, maxLength = 120) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, maxLength);
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

    const { data: profile, error: profileError } = await authClient
      .from('users')
      .select('id, full_name, email, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fullName: profile?.full_name || user.user_metadata?.full_name || '',
        email: profile?.email || user.email || '',
        phone: profile?.phone || '',
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authResult = await getAuthenticatedUser();
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user, authClient } = authResult;
    const body = await request.json();

    const fullName = sanitizeOptionalText(body?.fullName, 120);
    const phone = sanitizeOptionalText(body?.phone, 32);

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const { data: upsertedRows, error: upsertError } = await authClient
      .from('users')
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          email: user.email,
          phone,
        },
        { onConflict: 'id' }
      )
      .select('id, full_name, email, phone');

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // Keep auth metadata aligned with profile name shown in other UI components.
    const mergedMetadata = {
      ...(user.user_metadata || {}),
      full_name: fullName,
    };

    const adminClient = await createAdminClient();
    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: mergedMetadata,
    });

    if (authUpdateError) {
      return NextResponse.json(
        {
          error: `Profile saved but auth metadata update failed: ${authUpdateError.message}`,
        },
        { status: 500 }
      );
    }

    const saved = upsertedRows?.[0];

    return NextResponse.json({
      success: true,
      data: {
        fullName: saved?.full_name || fullName,
        email: saved?.email || user.email || '',
        phone: saved?.phone || '',
      },
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
