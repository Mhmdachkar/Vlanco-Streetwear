// Validate Environment Variables
console.log('🔧 Validating Environment Variables...');
console.log('=====================================');

// Load environment variables (simulating Vite's import.meta.env)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

if (!existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

// Read .env file manually
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]*?)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

console.log('\n📋 Environment Variables Status:');

const requiredVars = [
  { name: 'VITE_SUPABASE_URL', required: true, type: 'url' },
  { name: 'VITE_SUPABASE_ANON_KEY', required: true, type: 'jwt' },
  { name: 'SERVICE_ROLE_SECRET', required: false, type: 'jwt' },
  { name: 'STRIPE_PUBLISHABLE_KEY', required: false, type: 'stripe_pk' },
  { name: 'STRIPE_SECRET_KEY', required: false, type: 'stripe_sk' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: false, type: 'stripe_whsec' }
];

let allValid = true;

requiredVars.forEach(({ name, required, type }) => {
  const value = envVars[name];
  let status = '✅';
  let message = 'Valid';
  
  if (!value || value.includes('your_') || value.includes('here')) {
    if (required) {
      status = '❌';
      message = 'Missing or placeholder';
      allValid = false;
    } else {
      status = '⚠️';
      message = 'Optional - not set';
    }
  } else {
    // Type-specific validation
    switch (type) {
      case 'url':
        if (!value.startsWith('https://') || !value.includes('supabase.co')) {
          status = '❌';
          message = 'Invalid URL format';
          allValid = false;
        }
        break;
      case 'jwt':
        if (!value.startsWith('eyJ') || value.length < 100) {
          status = '❌';
          message = 'Invalid JWT format';
          allValid = false;
        }
        break;
      case 'stripe_pk':
        if (!value.startsWith('pk_')) {
          status = '❌';
          message = 'Should start with pk_';
          allValid = false;
        }
        break;
      case 'stripe_sk':
        if (!value.startsWith('sk_')) {
          status = '❌';
          message = 'Should start with sk_';
          allValid = false;
        }
        break;
      case 'stripe_whsec':
        if (!value.startsWith('whsec_')) {
          status = '❌';
          message = 'Should start with whsec_';
          allValid = false;
        }
        break;
    }
  }
  
  const displayValue = value && value.length > 20 ? 
    `${value.substring(0, 20)}...` : 
    (value || 'Not set');
    
  console.log(`${status} ${name}: ${message}`);
  if (value && !value.includes('your_')) {
    console.log(`   Value: ${displayValue}`);
  }
});

console.log('\n🎯 Summary:');
if (allValid) {
  console.log('✅ All required environment variables are valid!');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Visit: http://localhost:8080/tshirts');
  console.log('3. Test the debug tools');
} else {
  console.log('❌ Some environment variables need attention');
  console.log('\n🔧 Fix these issues:');
  console.log('1. Update your .env file with actual values');
  console.log('2. Get Supabase keys from: https://supabase.com/dashboard');
  console.log('3. Get Stripe keys from: https://dashboard.stripe.com/test/apikeys');
}

console.log('\n=====================================');



