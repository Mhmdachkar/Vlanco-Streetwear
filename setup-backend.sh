#!/bin/bash

# 🚀 VLANCO Streetwear Backend Setup Script
# This script will help you set up your Supabase backend quickly

echo "🚀 Starting VLANCO Streetwear Backend Setup..."
echo "================================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
else
    echo "✅ Supabase CLI found"
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "🔐 Please login to Supabase..."
    supabase login
else
    echo "✅ Already logged in to Supabase"
fi

# Link to project
echo "🔗 Linking to project..."
supabase link --project-ref okjxnqdppxwcfgtdggna

# Deploy database migrations
echo "🗃️ Deploying database migrations..."
supabase db push

# Deploy edge functions
echo "⚡ Deploying edge functions..."
supabase functions deploy

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in .env file"
echo "2. Configure Supabase secrets for edge functions"
echo "3. Test your setup with 'npm run dev'"
echo "4. Check the SETUP_COMPLETE_GUIDE.md for detailed instructions"
echo ""
echo "🔗 Your Supabase Dashboard: https://supabase.com/dashboard/project/okjxnqdppxwcfgtdggna"
