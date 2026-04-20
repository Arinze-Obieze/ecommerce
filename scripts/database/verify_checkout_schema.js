const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Ensure .env.local is set up.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('Verifying orders table schema...');
  
  // Check if total_amount column exists by trying to select it
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount')
    .limit(1);

  if (error) {
    console.error('Error verifying orders schema:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('FAIL: total_amount column does not exist on orders table.');
    }
  } else {
    console.log('SUCCESS: total_amount column exists on orders table.');
  }

  console.log('Verifying order_items table schema...');
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('variant_id')
    .limit(1);

  if (itemsError) {
    console.error('Error verifying order_items schema:', itemsError.message);
    if (itemsError.message.includes('does not exist')) {
      console.error('FAIL: variant_id column does not exist on order_items table.');
    }
  } else {
    console.log('SUCCESS: variant_id column exists on order_items table.');
  }
}

verifySchema();
