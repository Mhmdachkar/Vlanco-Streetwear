import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface TableSetupResult {
  table: string;
  status: 'idle' | 'creating' | 'success' | 'error' | 'exists';
  message: string;
}

const DatabaseSetup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [setupResults, setSetupResults] = useState<TableSetupResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTableStatus = (table: string, status: TableSetupResult['status'], message: string) => {
    setSetupResults(prev => {
      const existing = prev.find(r => r.table === table);
      if (existing) {
        return prev.map(r => r.table === table ? { ...r, status, message } : r);
      } else {
        return [...prev, { table, status, message }];
      }
    });
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      updateTableStatus('users', 'creating', 'Creating user profile...');
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          phone: user.user_metadata?.phone || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_verified: user.email_confirmed_at ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        if (error.code === '23505') {
          updateTableStatus('users', 'exists', 'User profile already exists');
        } else {
          updateTableStatus('users', 'error', `Failed to create user profile: ${error.message}`);
        }
      } else {
        updateTableStatus('users', 'success', 'User profile created successfully');
      }
    } catch (error) {
      updateTableStatus('users', 'error', `Error: ${error}`);
    }
  };

  const createMissingTables = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to set up database tables',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setSetupResults([]);

    try {
      // First, create user profile
      await createUserProfile();

      // Check and create wishlist_items table using raw SQL
      updateTableStatus('wishlist_items', 'creating', 'Creating wishlist_items table...');
      
      try {
        const { error: wishlistError } = await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS public.wishlist_items (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              product_id TEXT NOT NULL,
              variant_id TEXT,
              added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, product_id, variant_id)
            );
            
            ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "wishlist_items_select_policy" ON public.wishlist_items
                FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY IF NOT EXISTS "wishlist_items_insert_policy" ON public.wishlist_items
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY IF NOT EXISTS "wishlist_items_delete_policy" ON public.wishlist_items
                FOR DELETE USING (auth.uid() = user_id);
                
            GRANT INSERT, UPDATE, DELETE, SELECT ON public.wishlist_items TO authenticated;
          `
        });

        if (wishlistError) {
          // Try alternative approach - direct table creation
          const { error: directError } = await supabase
            .from('wishlist_items')
            .select('id')
            .limit(1);

          if (directError && directError.code === '42P01') {
            updateTableStatus('wishlist_items', 'error', 'Table does not exist and cannot be created via client. Please run migration manually.');
          } else {
            updateTableStatus('wishlist_items', 'exists', 'Table already exists');
          }
        } else {
          updateTableStatus('wishlist_items', 'success', 'wishlist_items table created successfully');
        }
      } catch (error) {
        updateTableStatus('wishlist_items', 'error', `Error creating wishlist_items: ${error}`);
      }

      // Check analytics_events table
      updateTableStatus('analytics_events', 'creating', 'Checking analytics_events table...');
      
      try {
        const { error: analyticsError } = await supabase
          .from('analytics_events')
          .select('id')
          .limit(1);

        if (analyticsError && analyticsError.code === '42P01') {
          updateTableStatus('analytics_events', 'error', 'Table does not exist. Please run the database migration.');
        } else {
          updateTableStatus('analytics_events', 'exists', 'Table exists and accessible');
        }
      } catch (error) {
        updateTableStatus('analytics_events', 'error', `Error checking analytics_events: ${error}`);
      }

      // Check other core tables
      const coreTables = ['cart_items', 'products', 'orders', 'reviews'];
      
      for (const tableName of coreTables) {
        updateTableStatus(tableName, 'creating', `Checking ${tableName} table...`);
        
        try {
          const { error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

          if (error && error.code === '42P01') {
            updateTableStatus(tableName, 'error', 'Table does not exist');
          } else if (error) {
            updateTableStatus(tableName, 'error', `Error: ${error.message}`);
          } else {
            updateTableStatus(tableName, 'exists', 'Table exists and accessible');
          }
        } catch (error) {
          updateTableStatus(tableName, 'error', `Error checking ${tableName}: ${error}`);
        }
      }

      toast({
        title: 'Database Setup Completed',
        description: 'Database table check and setup completed',
      });

    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: `Database setup failed: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TableSetupResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exists':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'creating':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TableSetupResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Created</Badge>;
      case 'exists':
        return <Badge variant="default" className="bg-blue-600">Exists</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'creating':
        return <Badge variant="secondary">Creating</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Database Setup & Repair
          </CardTitle>
          <CardDescription>
            Create missing database tables and fix database structure issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Database Setup Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some database tables may be missing. This tool will create your user profile and check for missing tables.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={createMissingTables} 
              disabled={isRunning || !user}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Setting up database...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Setup Database Tables
                </>
              )}
            </Button>
            
            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to set up database tables
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {setupResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Results</CardTitle>
            <CardDescription>Database table setup and verification results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {setupResults.map((result) => (
                <div key={result.table} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.table}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseSetup;
