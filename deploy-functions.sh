#!/bin/bash

# Deploy all Supabase Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "supabase/functions" ]; then
    echo "❌ supabase/functions directory not found. Please run this from the project root."
    exit 1
fi

# Login check
echo "🔐 Checking Supabase login status..."
if supabase auth status 2>&1 | grep -q "not logged in"; then
    echo "❌ Not logged in to Supabase. Please run: supabase auth login"
    exit 1
fi

# List of functions to deploy
functions=(
    "analytics-track"
    "cart-merge"
    "checkout-create-session"
    "discounts-apply"
    "inventory-hold"
    "inventory-sync"
    "notifications-enqueue"
    "reviews-submit"
    "stripe-webhook"
)

success_count=0
fail_count=0

for func in "${functions[@]}"; do
    echo "📦 Deploying function: $func"
    
    if supabase functions deploy "$func"; then
        echo "✅ Successfully deployed: $func"
        ((success_count++))
    else
        echo "❌ Failed to deploy: $func"
        ((fail_count++))
    fi
    
    sleep 1
done

echo ""
echo "📊 Deployment Summary:"
echo "✅ Successful: $success_count"
echo "❌ Failed: $fail_count"

if [ $fail_count -eq 0 ]; then
    echo ""
    echo "🎉 All functions deployed successfully!"
    echo "You can now test the functions in your application."
else
    echo ""
    echo "⚠️  Some functions failed to deploy. Please check the errors above."
fi
