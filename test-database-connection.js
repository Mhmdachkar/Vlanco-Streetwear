const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection & Tables...\n');

  const tables = [
    'analytics_events',
    'cart_items', 
    'wishlist_items',
    'products',
    'product_variants',
    'users',
    'user_sessions',
    'recently_viewed',
    'search_history',
    'orders',
    'notifications'
  ];

  let allTablesExist = true;

  for (const tableName of tables) {
    try {
      console.log(`📊 Testing ${tableName} table...`);
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ ${tableName}: ${error.message}`);
        if (error.code === '42P01') {
          console.error(`   → Table "${tableName}" does not exist!`);
        }
        allTablesExist = false;
      } else {
        console.log(`✅ ${tableName}: Table exists with ${count || 0} records`);
      }
    } catch (err) {
      console.error(`❌ ${tableName}: Exception - ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('🎉 All tables exist and are accessible!');
    console.log('✅ Database is ready for the application.');
  } else {
    console.log('⚠️  Some tables are missing or inaccessible.');
    console.log('❗ You need to apply the database migration:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run the migration from: supabase/migrations/20250125000000-complete-database-setup.sql');
    console.log('   3. Or use: npx supabase db push (if local setup works)');
  }

  console.log('\n🔗 Database URL:', supabaseUrl);
  console.log('🔑 Service Role Key:', supabaseKey ? '✅ Present' : '❌ Missing');
}

// Test basic connection first
async function testBasicConnection() {
  try {
    console.log('🔌 Testing basic connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Basic connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection exception:', err.message);
    return false;
  }
}

async function main() {
  const connected = await testBasicConnection();
  if (connected) {
    await testDatabaseConnection();
  }
}

main().catch(console.error);
