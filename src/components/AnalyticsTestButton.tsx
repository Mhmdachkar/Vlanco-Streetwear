import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database, Activity, CheckCircle, XCircle } from 'lucide-react';

const AnalyticsTestButton: React.FC = () => {
  const { track } = useAnalytics();
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const runAnalyticsTest = async () => {
    // Allow testing without authentication for debugging purposes
    console.log('🔍 Analytics Test - User status:', user ? `Logged in as ${user.email}` : 'Not logged in');
    
    if (!user) {
      console.log('⚠️ Running analytics test without authentication (debug mode)');
      toast({
        title: "Running Test Without Auth",
        description: "Testing analytics in debug mode (some features may be limited)",
        variant: "default"
      });
    }

    setTesting(true);
    setLastResult(null);

    try {
      console.log('🧪 Starting analytics test...');
      
      // 1. Track a test event (works with or without authentication)
      const testEventData = {
        test_type: 'manual_analytics_test',
        timestamp: new Date().toISOString(),
        user_id: user?.id || null,
        page: 'analytics_test',
        action: 'button_click',
        test_mode: user ? 'authenticated' : 'anonymous'
      };

      console.log('📤 Sending test event:', testEventData);
      await track('analytics_test_event', testEventData);
      console.log('✅ Test event sent successfully');

      // 2. Wait a moment for the event to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Query the database to verify the event was stored
      console.log('🔍 Querying database for test event...');
      let queryResult;
      
      if (user) {
        // For authenticated users, query by user_id
        queryResult = await supabase
          .from('analytics_events')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_type', 'analytics_test_event')
          .order('created_at', { ascending: false })
          .limit(1);
      } else {
        // For anonymous users, query recent events without user_id
        queryResult = await supabase
          .from('analytics_events')
          .select('*')
          .is('user_id', null)
          .eq('event_type', 'analytics_test_event')
          .order('created_at', { ascending: false })
          .limit(3); // Get a few recent events to find our test
      }
      
      const { data: events, error } = queryResult;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      console.log('📊 Query result:', events);

      if (events && events.length > 0) {
        console.log('🎉 SUCCESS: Analytics event found in database!');
        console.log('📋 Event details:', events[0]);
        
        setLastResult('success');
        toast({
          title: "✅ Analytics Test Passed",
          description: "Event successfully stored in database",
          duration: 5000
        });
      } else {
        console.log('❌ FAILED: No analytics event found in database');
        
        setLastResult('error');
        toast({
          title: "❌ Analytics Test Failed",
          description: "Event not found in database",
          variant: "destructive",
          duration: 5000
        });
      }

    } catch (error) {
      console.error('🚨 Analytics test failed:', error);
      console.error('🚨 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setLastResult('error');
      toast({
        title: "❌ Analytics Test Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={runAnalyticsTest}
        disabled={testing}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500"
      >
        {testing ? (
          <>
            <Activity className="w-4 h-4 mr-2 animate-spin" />
            Testing Analytics...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 mr-2" />
            Test Analytics Storage
          </>
        )}
      </Button>
      
      {lastResult === 'success' && (
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Passed</span>
        </div>
      )}
      
      {lastResult === 'error' && (
        <div className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">Failed</span>
        </div>
      )}
      
      {!user && (
        <span className="text-sm text-yellow-500">Anonymous mode</span>
      )}
    </div>
  );
};

export default AnalyticsTestButton;
