#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting build process..."

# Clean up previous build
echo "🧹 Cleaning up previous build..."
rm -rf stockmonitor-build
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create production build
echo "🔨 Creating production build..."
VITE_APP_VERSION=$(date +%Y%m%d_%H%M%S) npm run build

# Create build directory
echo "📁 Creating build directory..."
mkdir -p stockmonitor-build

# Copy build files
echo "📋 Copying build files..."
cp -r dist/* stockmonitor-build/

# Setup Netlify password protection
echo "🔒 Setting up password protection..."
cat > stockmonitor-build/_headers << EOL
/*
  Basic-Auth: stockmonitor:stockmonitor2025
EOL

# Setup Netlify redirects
echo "⚙️ Setting up Netlify configuration..."
cat > stockmonitor-build/_redirects << EOL
/*    /index.html   200
EOL

# Copy environment variables
echo "🔒 Copying environment variables..."
cp .env stockmonitor-build/.env

echo "✅ Build completed successfully!"
echo "📂 Your build is ready in the stockmonitor-build directory"
echo "🌐 You can now deploy this to Netlify"
echo "🔑 Site is password protected with:"
echo "   Username: stockmonitor"
echo "   Password: stockmonitor2025" 