const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer Service Role Key for full access
const supabaseKey = process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const logStream = fs.createWriteStream('schema_report.txt');
  function log(msg) {
    console.log(msg);
    logStream.write(msg + '\n');
  }

  log('--- Inspecting Database Schema ---');
  log(`Using Key: ${supabaseKey.substring(0, 10)}... (Service Role: ${!!process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY})`);

  console.log('--- Inspecting Database Schema ---');

  let tablesToCheck = [];

  try {
    // Attempt to fetch all tables from public schema
    // Note: This often requires permissions adjustments or Service Role key to work via PostgREST
    // if 'information_schema' is not exposed. However, standard Supabase query often works if table is accessible?
    // Actually, usually info schema is not exposed to anon.
    // Let's try it.
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
       log(`Could not list tables dynamically: ${error.message}`);
       tablesToCheck = [
        'products',
        'categories',
        'product_categories',
        'collections', 
        'product_collections',
        'users',
        'profiles',
        'orders',
        'order_items',
        'cart',
        'reviews',
        'wishlist',
        'addresses'
      ];
    } else if (tables) {
       tablesToCheck = tables.map(t => t.table_name);
       log(`Found tables in 'public' schema: ${tablesToCheck.join(', ')}`);
    }
  } catch (err) {
      log(`Error trying to list tables: ${err.message}`);
      tablesToCheck = ['products', 'categories']; // Fallback
  }

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === '42P01') { // undefined_table
           // log(`Table '${table}' does not exist.`);
        } else {
           log(`Error accessing '${table}': ${error.message} (${error.code})`);
        }
      } else if (data) {
        log(`\nTable: [${table}]`);
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          log(`Columns (${columns.length}): ${columns.join(', ')}`);
          log(`Sample Row: ${JSON.stringify(data[0])}`);
        } else {
          log(`(Exists but empty, cannot infer columns from simple select)`);
          // Try fetching structure via explicit RPC or just hope for the best if empty
        }
      }
    } catch (e) {
      log(`Exception checking ${table}: ${e.message}`);
    }
  }
  
  // Try to list all buckets (Storage)
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (!bucketError && buckets) {
      console.log('\n--- Storage Buckets ---');
      buckets.forEach(b => console.log(`- ${b.name}`));
  }
}

inspectSchema();
