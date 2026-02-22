'use server';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, email, phone, state, password } = body;

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    //  Create server-side Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY
    );

    // 1️⃣ Create Auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });
    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    const userId = signUpData.user.id;

    // 2️⃣ Insert profile via RPC
    const { error: rpcError } = await supabase.rpc('insert_user_profile', {
      p_id: userId,
      p_full_name: fullName,
      p_email: email,
      p_phone: phone || null,
      p_state: state || null,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to create profile: ' + rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 }
    );
  }
}
