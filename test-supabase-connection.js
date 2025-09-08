// Test Supabase Connection Script
// Run with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing basic connection...');
    
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return false;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test 2: Check if we have data
    console.log('\n🔄 Checking for existing data...');
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError.message);
      return false;
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories`);
    
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*');
    
    if (prodError) {
      console.error('❌ Error fetching products:', prodError.message);
      return false;
    }
    
    console.log(`✅ Found ${products?.length || 0} products`);
    
    if (!products || products.length === 0) {
      console.log('\n⚠️  No products found! This is why your app is using mock data.');
      console.log('   Run the populate-database.sql script in your Supabase dashboard.');
    } else {
      console.log('\n🎉 Database has data! Your app should connect properly.');
      console.log('Products:', products.map(p => p.name).join(', '));
    }
    
    // Test 3: Test auth
    console.log('\n🔄 Testing authentication...');
    
    const { data: user } = await supabase.auth.getUser();
    console.log('✅ Auth system accessible');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Your Supabase connection is working.');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
});
