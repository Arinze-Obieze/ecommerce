const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY
);

async function inspectColumns() {
  console.log('Checking if "total" column exists in "orders"...');
  
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .limit(1);

  if (error) {
    console.error('Error selecting total:', error.message);
  } else {
    console.log('Success! "total" column likely exists (or at least query did not fail on column name).');
  }
}

inspectColumns();
