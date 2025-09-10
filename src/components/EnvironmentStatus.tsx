import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Database, 
  CreditCard, 
  Zap, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  validateAllEnvironment, 
  getEnvironmentSummary, 
  isCriticalEnvConfigured,
  type EnvironmentCheck 
} from '@/utils/environmentValidation';
import { stripeConfig } from '@/lib/stripe';

const EnvironmentStatus: React.FC = () => {
  const [checks, setChecks] = useState<EnvironmentCheck[]>([]);
  const [showSensitive, setShowSensitive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnvironmentStatus();
  }, []);

  const loadEnvironmentStatus = () => {
    setLoading(true);
    try {
      const allChecks = validateAllEnvironment();
      setChecks(allChecks);
    } catch (error) {
      console.error('Error loading environment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load environment status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const summary = getEnvironmentSummary();
  const isCriticalOk = isCriticalEnvConfigured();

  const getStatusIcon = (valid: boolean, required: boolean) => {
    if (valid) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (required) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusColor = (valid: boolean, required: boolean) => {
    if (valid) return 'bg-green-100 text-green-800 border-green-200';
    if (required) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'supabase': return <Database className="h-4 w-4" />;
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'features': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'supabase': return 'Database & Auth';
      case 'stripe': return 'Payment Processing';
      case 'features': return 'Feature Flags';
      case 'app': return 'App Configuration';
      default: return 'Other';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Environment variable copied',
    });
  };

  const formatValue = (check: EnvironmentCheck) => {
    if (!check.value) return 'Not set';
    
    if (check.name.includes('SECRET') || check.name.includes('KEY')) {
      if (!showSensitive) {
        return `${check.value.substring(0, 20)}...`;
      }
    }
    
    return check.value;
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, EnvironmentCheck[]>);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Environment Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Configuration
            </CardTitle>
            <CardDescription>
              Monitor and validate your environment variables
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitive ? 'Hide' : 'Show'} Sensitive
            </Button>
            <Button variant="outline" size="sm" onClick={loadEnvironmentStatus}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Overall Health</div>
            <div className={`text-lg font-semibold ${isCriticalOk ? 'text-green-600' : 'text-red-600'}`}>
              {isCriticalOk ? 'Healthy' : 'Issues Found'}
            </div>
            <Progress value={summary.completionRate} className="mt-2" />
            <div className="text-xs text-gray-500 mt-1">
              {summary.valid}/{summary.total} configured ({summary.completionRate}%)
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Database Status</div>
            <div className="text-lg font-semibold text-blue-700">
              {isCriticalOk ? 'Connected' : 'Configuration Required'}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {summary.validRequired}/{summary.required} required variables set
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600">Stripe Status</div>
            <div className="text-lg font-semibold text-purple-700">
              {stripeConfig.isConfigured ? `Ready (${stripeConfig.mode})` : 'Not Configured'}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Payment processing {stripeConfig.isConfigured ? 'enabled' : 'disabled'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="supabase">Database</TabsTrigger>
            <TabsTrigger value="stripe">Payments</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
              <div key={category} className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  {getCategoryIcon(category)}
                  {getCategoryTitle(category)}
                </h3>
                <div className="grid gap-2">
                  {categoryChecks.map((check) => (
                    <div
                      key={check.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.valid, check.required)}
                        <div>
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-gray-600">{check.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(check.valid, check.required)}>
                          {check.required ? 'Required' : 'Optional'}
                        </Badge>
                        {check.value && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(check.value!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="space-y-4">
                {categoryChecks.map((check) => (
                  <Card key={check.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.valid, check.required)}
                          <CardTitle className="text-lg">{check.name}</CardTitle>
                          <Badge className={getStatusColor(check.valid, check.required)}>
                            {check.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        {check.value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(check.value!)}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Status: </span>
                          <span className={check.valid ? 'text-green-600' : 'text-red-600'}>
                            {check.message}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Value: </span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {formatValue(check)}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnvironmentStatus;
