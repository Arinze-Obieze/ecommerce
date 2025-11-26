'use server';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerClient() {
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, 
    cookies: {
      getAll: () => cookies().getAll(),
      setAll: (newCookies) => {
        newCookies.forEach(({ name, value, options }) => {
          cookies().set(name, value, options);
        });
      },
    },
  });

  return supabase;
}
