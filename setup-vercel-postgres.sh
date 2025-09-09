#!/bin/bash

echo "🚀 Setting up Vercel Postgres for LingoHub"
echo "=========================================="
echo ""
echo "Prerequisites:"
echo "1. Create a Postgres database in Vercel Dashboard"
echo "2. Connect it to your project"
echo ""
echo "Press Enter when you've completed the above steps..."
read

echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Go to: https://vercel.com/dashboard/stores"
echo "2. Click on your database → Settings → Environment Variables"
echo "3. Copy the POSTGRES_PRISMA_URL value"
echo ""
echo "Enter your POSTGRES_PRISMA_URL:"
read DATABASE_URL

echo ""
echo "🔐 Generating JWT secrets..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo ""
echo "📋 Add these environment variables to your Vercel project:"
echo "==========================================================="
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "Go to your Vercel project → Settings → Environment Variables"
echo "Add the above variables"
echo ""
echo "Press Enter when done..."
read

echo ""
echo "🗄️ Running database migrations..."
cd backend
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo ""
echo "🌱 Seeding database..."
DATABASE_URL="$DATABASE_URL" npx tsx src/scripts/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "Deploy your backend with: vercel --prod"