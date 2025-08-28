/**
 * Database Connection Test Utility
 * This utility tests all database tables and functions to ensure they're properly connected
 */

import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  name: string;
  type: 'table' | 'function';
  status: 'success' | 'error';
  message: string;
  details?: any;
}

/**
 * Test all database tables for connectivity
 */
export const testAllTables = async (): Promise<TestResult[]> => {
  // Start with basic tables that should exist
  const basicTables = ['users', 'products'];
  
  // Advanced tables that require migration
  const advancedTables = [
    'product_variants',
    'product_images',
    'cart_items',
    'wishlists',
    'orders',
    'order_items',
    'reviews',
    'addresses',
    'notifications',
    'support_tickets',
    'support_messages',
    'user_activities',
    'search_history',
    'recently_viewed',
    'inventory_transactions',
    'returns',
    'return_items',
    'push_tokens',
    'website_analytics',
    'user_sessions',
    'page_views',
    'product_interactions',
    'stock_reservations'
  ];

  const results: TestResult[] = [];

  // Test basic tables first
  for (const table of basicTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        results.push({
          name: table,
          type: 'table',
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: error
        });
      } else {
        results.push({
          name: table,
          type: 'table',
          status: 'success',
          message: `Connected successfully (${count || 0} rows)`,
          details: { rowCount: count }
        });
      }
    } catch (error) {
      results.push({
        name: table,
        type: 'table',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }
  }

  // Test advanced tables with better error handling
  for (const table of advancedTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        // Check if it's a "relation does not exist" error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          results.push({
            name: table,
            type: 'table',
            status: 'error',
            message: `Table does not exist - Migration needed`,
            details: { migrationRequired: true, error: error.message }
          });
        } else {
          results.push({
            name: table,
            type: 'table',
            status: 'error',
            message: `Connection failed: ${error.message}`,
            details: error
          });
        }
      } else {
        results.push({
          name: table,
          type: 'table',
          status: 'success',
          message: `Connected successfully (${count || 0} rows)`,
          details: { rowCount: count }
        });
      }
    } catch (error) {
      results.push({
        name: table,
        type: 'table',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }
  }

  return results;
};

/**
 * Test all database functions for execution
 */
export const testAllFunctions = async (): Promise<TestResult[]> => {
  const functions = [
    {
      name: 'get_real_time_analytics',
      params: []
    },
    {
      name: 'cleanup_expired_reservations',
      params: []
    },
    {
      name: 'reserve_stock',
      params: {
        p_product_id: '00000000-0000-0000-0000-000000000000',
        p_variant_id: '00000000-0000-0000-0000-000000000000',
        p_quantity: 1,
        p_session_id: 'test_session'
      }
    },
    {
      name: 'track_user_activity',
      params: {
        p_page_url: '/test',
        p_session_id: 'test_session',
        p_time_spent: 0
      }
    },
    {
      name: 'convert_reservation_to_purchase',
      params: {
        p_reservation_id: '00000000-0000-0000-0000-000000000000'
      }
    }
  ];

  const results: TestResult[] = [];

  for (const func of functions) {
    try {
      const { data, error } = await supabase.rpc(func.name, func.params);

      if (error) {
        // Some functions expect authentication, so certain errors are expected
        if (error.message.includes('JWT') || error.message.includes('auth')) {
          results.push({
            name: func.name,
            type: 'function',
            status: 'success',
            message: 'Function exists (authentication required)',
            details: { expectedError: error.message }
          });
        } else {
          results.push({
            name: func.name,
            type: 'function',
            status: 'error',
            message: `Execution failed: ${error.message}`,
            details: error
          });
        }
      } else {
        results.push({
          name: func.name,
          type: 'function',
          status: 'success',
          message: 'Function executed successfully',
          details: { result: data }
        });
      }
    } catch (error) {
      results.push({
        name: func.name,
        type: 'function',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }
  }

  return results;
};

/**
 * Test database security policies
 */
export const testSecurityPolicies = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  try {
    // Test unauthenticated access to cart (should fail)
    const { data: cartData, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);

    if (cartError && cartError.message.includes('JWT')) {
      results.push({
        name: 'cart_items_security',
        type: 'table',
        status: 'success',
        message: 'Security policy working - unauthenticated access blocked',
        details: { expectedError: cartError.message }
      });
    } else {
      results.push({
        name: 'cart_items_security',
        type: 'table',
        status: 'error',
        message: 'Security policy failed - unauthenticated access allowed',
        details: { data: cartData }
      });
    }

    // Test public access to products (should work)
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError) {
      results.push({
        name: 'products_public_access',
        type: 'table',
        status: 'error',
        message: 'Public access failed',
        details: productError
      });
    } else {
      results.push({
        name: 'products_public_access',
        type: 'table',
        status: 'success',
        message: 'Public access working - products accessible',
        details: { rowCount: productData?.length || 0 }
      });
    }

  } catch (error) {
    results.push({
      name: 'security_policies',
      type: 'table',
      status: 'error',
      message: `Security test failed: ${error.message}`,
      details: error
    });
  }

  return results;
};

/**
 * Run comprehensive database test
 */
export const runCompleteDatabaseTest = async (): Promise<{
  tables: TestResult[];
  functions: TestResult[];
  security: TestResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    overallStatus: 'success' | 'partial' | 'error';
  };
}> => {
  console.log('🧪 Starting comprehensive database test...');

  try {
    // Test all components with individual error handling
    let tables: TestResult[] = [];
    let functions: TestResult[] = [];
    let security: TestResult[] = [];

    try {
      console.log('📊 Testing tables...');
      tables = await testAllTables();
    } catch (error) {
      console.error('❌ Table test failed:', error);
      tables = [{
        name: 'table_test',
        type: 'table',
        status: 'error',
        message: `Table test failed: ${error.message}`,
        details: error
      }];
    }

    try {
      console.log('⚡ Testing functions...');
      functions = await testAllFunctions();
    } catch (error) {
      console.error('❌ Function test failed:', error);
      functions = [{
        name: 'function_test',
        type: 'function',
        status: 'error',
        message: `Function test failed: ${error.message}`,
        details: error
      }];
    }

    try {
      console.log('🔒 Testing security...');
      security = await testSecurityPolicies();
    } catch (error) {
      console.error('❌ Security test failed:', error);
      security = [{
        name: 'security_test',
        type: 'function',
        status: 'error',
        message: `Security test failed: ${error.message}`,
        details: error
      }];
    }

    // Calculate summary
    const allTests = [...tables, ...functions, ...security];
    const successfulTests = allTests.filter(test => test.status === 'success').length;
    const failedTests = allTests.filter(test => test.status === 'error').length;
    const totalTests = allTests.length;

    let overallStatus: 'success' | 'partial' | 'error';
    if (failedTests === 0) {
      overallStatus = 'success';
    } else if (successfulTests > failedTests) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'error';
    }

    const summary = {
      totalTests,
      successfulTests,
      failedTests,
      overallStatus
    };

    // Log results
    console.log('📊 Database Test Results:');
    console.log(`✅ Successful: ${successfulTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Overall Status: ${overallStatus.toUpperCase()}`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      allTests
        .filter(test => test.status === 'error')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    return { tables, functions, security, summary };
  } catch (error) {
    console.error('🚨 Critical error in database test:', error);
    // Return a fallback result
    return {
      tables: [{
        name: 'critical_error',
        type: 'table',
        status: 'error',
        message: `Critical test error: ${error.message}`,
        details: error
      }],
      functions: [],
      security: [],
      summary: {
        totalTests: 1,
        successfulTests: 0,
        failedTests: 1,
        overallStatus: 'error'
      }
    };
  }
};

/**
 * Quick health check for critical tables
 */
export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    // Start with basic tables that should exist
    const basicTables = ['products', 'users'];
    
    for (const table of basicTables) {
      const { error } = await supabase
        .from(table)
        .select('*', { head: true })
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table} health check failed:`, error.message);
        return false;
      }
    }
    
    console.log('✅ Quick health check passed - Basic tables accessible');
    return true;
  } catch (error) {
    console.error('❌ Quick health check failed:', error.message);
    return false;
  }
};

/**
 * Check which tables actually exist in the database
 */
export const checkTableExistence = async (): Promise<{ [key: string]: boolean }> => {
  console.log('🔍 checkTableExistence: Starting table existence check...');
  
  const tablesToCheck = [
    'users', 'products', 'product_variants', 'product_images', 'cart_items',
    'wishlists', 'orders', 'order_items', 'reviews', 'addresses',
    'notifications', 'support_tickets', 'support_messages', 'user_activities',
    'search_history', 'recently_viewed', 'inventory_transactions', 'returns',
    'return_items', 'push_tokens', 'website_analytics', 'user_sessions',
    'page_views', 'product_interactions', 'stock_reservations'
  ];

  const results: { [key: string]: boolean } = {};
  let completedTables = 0;

  console.log(`🔍 checkTableExistence: Checking ${tablesToCheck.length} tables...`);

  // Process tables in smaller batches to avoid overwhelming the connection
  const batchSize = 5;
  for (let i = 0; i < tablesToCheck.length; i += batchSize) {
    const batch = tablesToCheck.slice(i, i + batchSize);
    console.log(`🔍 checkTableExistence: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tablesToCheck.length/batchSize)}`);
    
    // Process batch concurrently with individual timeouts
    const batchPromises = batch.map(async (table) => {
      try {
        console.log(`🔍 checkTableExistence: Checking table: ${table}`);
        
        // Add individual timeout for each table check
        const tableCheck = supabase
          .from(table)
          .select('*', { head: true })
          .limit(1);
        
        const { error } = await Promise.race([
          tableCheck,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Table ${table} check timed out`)), 5000)
          )
        ]);
        
        results[table] = !error;
        completedTables++;
        
        if (error) {
          console.log(`🔍 checkTableExistence: ❌ ${table} - ${error.message}`);
        } else {
          console.log(`🔍 checkTableExistence: ✅ ${table} - exists`);
        }
        
        return { table, success: !error, error: error?.message };
        
      } catch (error) {
        console.log(`🔍 checkTableExistence: ❌ ${table} - exception: ${error.message}`);
        results[table] = false;
        completedTables++;
        return { table, success: false, error: error.message };
      }
    });
    
    // Wait for batch to complete before moving to next batch
    const batchResults = await Promise.allSettled(batchPromises);
    console.log(`🔍 checkTableExistence: Batch ${Math.floor(i/batchSize) + 1} completed. Results:`, batchResults);
    
    // Small delay between batches to avoid overwhelming the connection
    if (i + batchSize < tablesToCheck.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`🔍 checkTableExistence: Completed! Checked ${completedTables}/${tablesToCheck.length} tables`);
  console.log('🔍 checkTableExistence: Results:', results);
  
  return results;
};

export default {
  testAllTables,
  testAllFunctions,
  testSecurityPolicies,
  runCompleteDatabaseTest,
  quickHealthCheck,
  checkTableExistence
};
