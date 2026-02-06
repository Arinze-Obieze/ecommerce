import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    return Response.json({
      success: true,
      data: collections
    })
  } catch (error) {
    console.error('Collections API Error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
