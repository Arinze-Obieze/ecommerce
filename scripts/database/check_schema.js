require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIdType() {
  console.log('--- Checking products id type ---');
  const { data: pData, error: pError } = await supabase
    .from('products')
    .select('id')
    .limit(1);
    
  if (pError) console.error('Error fetching products:', pError.message);
  else console.log('Product ID value:', pData.length > 0 ? pData[0].id : 'No data');
  if (pData.length > 0) {
      console.log('Type of Product ID (JS):', typeof pData[0].id);
  }
}

checkIdType();
