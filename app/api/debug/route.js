// app/api/debug/route.js
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    
    // Test query to see if we can fetch anything
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (testError) {
      return Response.json({
        success: false,
        error: testError.message,
        code: testError.code
      }, { status: 500 })
    }
    
    // Get table info
    const { data: tableInfo } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    return Response.json({
      success: true,
      testData,
      totalCount: tableInfo?.length || 0,
      tableName: 'products',
      message: `Found ${testData?.length || 0} products`
    })
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
