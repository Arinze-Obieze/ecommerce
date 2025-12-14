import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies() 

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          // Supabase session cookies only
          const cookieNames = ['sb-access-token', 'sb-refresh-token', 'sb-provider-token']
          return cookieNames
            .map(name => {
              const cookie = cookieStore.get?.(name)
              if (!cookie) return null
              return { name, value: cookie.value }
            })
            .filter(Boolean)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set?.(name, value, options)
          })
        },
      },
    }
  )
}
