# 🔓 Public Test Function (No Auth Required)

## 🚀 **Create a Truly Public Function**

### **Function Name:** `test-public`

**Code:**
```typescript
// deno-lint-ignore-file no-explicit-any

function jsonResponse(body: any, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...(init.headers || {}),
    },
  });
}

export const handler = async (request: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Allow all methods for testing
  return jsonResponse({ 
    message: "Hello from Supabase Edge Function!",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    auth: "Public function - no authentication required",
    headers: Object.fromEntries(request.headers.entries())
  });
};

serve(handler);
```

## 🧪 **Test This Function**

### **Method 1: PowerShell**
```powershell
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/test-public
```

### **Method 2: Browser**
Just visit: https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/test-public

### **Method 3: With Headers**
```powershell
curl -X POST https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/test-public -H "Content-Type: application/json"
```

## 🔧 **If Still Getting 401 Error**

### **Step 1: Check Supabase Dashboard Settings**

1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/settings/functions
2. Look for **"Enable JWT verification"** or **"Require authentication"**
3. **Disable it** if it's enabled

### **Step 2: Check Function-Level Settings**

1. Go to: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna/functions
2. Click on your function
3. Look for **"Authentication"** or **"Security"** settings
4. **Disable authentication** for this specific function

### **Step 3: Alternative - Use GET Method**

Try testing with GET instead of POST:

```powershell
curl https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/test-public
```

## 🎯 **Expected Response**

If working correctly:
```json
{
  "message": "Hello from Supabase Edge Function!",
  "timestamp": "2025-08-30T00:20:30.123Z",
  "method": "POST",
  "url": "https://okjxnqdppxwcfgtdggna.supabase.co/functions/v1/test-public",
  "auth": "Public function - no authentication required",
  "headers": { ... }
}
```

## 🚨 **If Still Not Working**

The issue might be:
1. **Global authentication enabled** in Supabase project settings
2. **Function not deployed correctly**
3. **Environment variables missing**

Try the browser method first - it's the simplest way to test!
