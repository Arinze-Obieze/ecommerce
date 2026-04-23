import { errorJson, publicJson } from '@/utils/platform/api-response'
import { createPublicClient } from '@/utils/supabase/public'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createPublicClient()
    
    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, slug, description, image_url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    return publicJson({
      success: true,
      data: collections || []
    })
  } catch (error) {
    console.error('Collections API Error:', error)
    return errorJson('Failed to fetch collections')
  }
}
