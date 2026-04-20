const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY
);

async function inspectOrders() {
  console.log('Inspecting orders table...');
  
  // Try to insert a dummy row to see if we can get column info from error or success
  // Actually, let's just try to select some common column names
  const potentialColumns = ['total', 'amount', 'total_amount', 'price', 'cost', 'sum'];
  
  for (const col of potentialColumns) {
      const { error } = await supabase.from('orders').select(col).limit(1);
      if (!error) {
          console.log(`Column '${col}' EXISTS.`);
      } else {
          console.log(`Column '${col}' does NOT exist (or error: ${error.message})`);
      }
  }
}

inspectOrders();
