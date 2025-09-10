import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Settings, CheckCircle, XCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

const EnvironmentChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showSensitive, setShowSensitive] = useState(false);

  const checkEnvironment = async () => {
    setChecking(true);
    setResults([]);

    try {
      console.log('🔧 Checking environment configuration...');
      
      const envChecks = [
        {
          name: 'VITE_SUPABASE_URL',
          value: import.meta.env.VITE_SUPABASE_URL,
          required: true,
          sensitive: false,
          validation: (val: string) => {
            if (!val) return { valid: false, message: 'Missing' };
            if (!val.includes('supabase.co')) return { valid: false, message: 'Invalid format - should contain supabase.co' };
            if (!val.startsWith('https://')) return { valid: false, message: 'Should start with https://' };
            return { valid: true, message: 'Valid' };
          }
        },
        {
          name: 'VITE_SUPABASE_ANON_KEY',
          value: import.meta.env.VITE_SUPABASE_ANON_KEY,
          required: true,
          sensitive: true,
          validation: (val: string) => {
            if (!val) return { valid: false, message: 'Missing' };
            if (val.length < 100) return { valid: false, message: 'Too short - anon keys are usually 100+ characters' };
            if (!val.startsWith('eyJ')) return { valid: false, message: 'Invalid format - should start with eyJ' };
            return { valid: true, message: 'Valid format' };
          }
        },
        {
          name: 'SUPABASE_SERVICE_ROLE_KEY',
          value: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
          required: false,
          sensitive: true,
          validation: (val: string) => {
            if (!val) return { valid: true, message: 'Optional - not set' };
            if (val.length < 100) return { valid: false, message: 'Too short for service role key' };
            if (!val.startsWith('eyJ')) return { valid: false, message: 'Invalid format - should start with eyJ' };
            return { valid: true, message: 'Valid format' };
          }
        },
        {
          name: 'STRIPE_SECRET_KEY',
          value: import.meta.env.STRIPE_SECRET_KEY,
          required: false,
          sensitive: true,
          validation: (val: string) => {
            if (!val) return { valid: true, message: 'Optional - not set' };
            if (!val.startsWith('sk_')) return { valid: false, message: 'Should start with sk_' };
            return { valid: true, message: 'Valid format' };
          }
        },
        {
          name: 'STRIPE_PUBLISHABLE_KEY',
          value: import.meta.env.STRIPE_PUBLISHABLE_KEY,
          required: false,
          sensitive: false,
          validation: (val: string) => {
            if (!val) return { valid: true, message: 'Optional - not set' };
            if (!val.startsWith('pk_')) return { valid: false, message: 'Should start with pk_' };
            return { valid: true, message: 'Valid format' };
          }
        },
        {
          name: 'STRIPE_WEBHOOK_SECRET',
          value: import.meta.env.STRIPE_WEBHOOK_SECRET,
          required: false,
          sensitive: true,
          validation: (val: string) => {
            if (!val) return { valid: true, message: 'Optional - not set' };
            if (!val.startsWith('whsec_')) return { valid: false, message: 'Should start with whsec_' };
            return { valid: true, message: 'Valid format' };
          }
        }
      ];

      const results = envChecks.map(check => {
        const validation = check.validation(check.value || '');
        return {
          ...check,
          ...validation,
          displayValue: check.sensitive && !showSensitive 
            ? (check.value ? `${check.value.substring(0, 20)}...` : 'Not set')
            : check.value || 'Not set'
        };
      });

      setResults(results);

      // Test basic fetch to Supabase URL
      if (results[0].valid) {
        try {
          console.log('🌐 Testing basic HTTP connectivity to Supabase...');
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          
          // Test basic connectivity with a simple HTTP request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('📡 HTTP Response:', response.status, response.statusText);
          
          if (response.ok || response.status === 404) {
            // 404 is expected for root endpoint
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: true,
              message: `HTTP connection successful (${response.status})`,
              displayValue: 'Connected'
            });
          } else if (response.status === 401) {
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: false,
              message: 'Authentication failed - check anon key',
              displayValue: 'Auth Error'
            });
          } else {
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: false,
              message: `HTTP error: ${response.status} ${response.statusText}`,
              displayValue: 'HTTP Error'
            });
          }
          
        } catch (fetchError: any) {
          console.error('❌ HTTP connectivity test failed:', fetchError);
          
          if (fetchError.name === 'AbortError') {
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: false,
              message: 'Connection timeout - network or URL issue',
              displayValue: 'Timeout'
            });
          } else if (fetchError.message?.includes('Failed to fetch')) {
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: false,
              message: 'Network error - check internet connection',
              displayValue: 'Network Error'
            });
          } else {
            results.push({
              name: 'HTTP_CONNECTIVITY',
              valid: false,
              message: `Connection error: ${fetchError.message}`,
              displayValue: 'Connection Error'
            });
          }
        }
      }

      setResults([...results]);

      // Summary
      const validCount = results.filter(r => r.valid).length;
      const requiredCount = results.filter(r => r.required).length;
      const requiredValidCount = results.filter(r => r.required && r.valid).length;

      toast({
        title: "Environment Check Complete",
        description: `${validCount}/${results.length} checks passed. ${requiredValidCount}/${requiredCount} required variables valid.`,
        variant: requiredValidCount === requiredCount ? 'default' : 'destructive',
        duration: 5000
      });

    } catch (error: any) {
      console.error('🚨 Environment check failed:', error);
      toast({
        title: "Environment Check Failed",
        description: error.message,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Environment variable copied",
      duration: 2000
    });
  };

  const getStatusIcon = (valid: boolean, required: boolean) => {
    if (valid) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (required) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          onClick={checkEnvironment}
          disabled={checking}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-orange-600 hover:to-yellow-500"
        >
          {checking ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Checking Environment...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Check Environment
            </>
          )}
        </Button>
        
        {results.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitive(!showSensitive)}
            className="text-xs"
          >
            {showSensitive ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {showSensitive ? 'Hide' : 'Show'} Keys
          </Button>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-3">Environment Configuration:</h3>
          
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.valid, result.required)}
                    <span className="font-medium text-white text-sm">{result.name}</span>
                    {result.required && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-1 rounded">Required</span>
                    )}
                  </div>
                  
                  {result.value && result.name !== 'HTTP_CONNECTIVITY' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.value)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 mb-1">
                  Status: <span className={result.valid ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </span>
                </div>
                
                {result.name !== 'HTTP_CONNECTIVITY' && (
                  <div className="text-xs font-mono bg-gray-900/50 p-2 rounded text-gray-300 break-all">
                    {result.displayValue}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">🔧 Setup Instructions:</h4>
            <div className="text-xs text-blue-200 space-y-1">
              <div>1. Create <code>.env</code> file in project root</div>
              <div>2. Add your Supabase project URL and anon key</div>
              <div>3. Get these from: Supabase Dashboard → Settings → API</div>
              <div>4. Restart your dev server after adding variables</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentChecker;
