#!/bin/bash

# Pre-push check script
# Ensures code quality before pushing to remote

set -e  # Exit on any error

echo "🔍 Running pre-push checks..."

# Change to the app directory
cd "$(dirname "$0")/.."

echo "📋 Step 1: Running ESLint..."
npm run lint

echo "📋 Step 2: Running TypeScript type check..."
npx tsc --noEmit

echo "📋 Step 3: Running Next.js build..."
npm run build

echo "✅ All checks passed! Safe to push."
