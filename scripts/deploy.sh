#!/bin/bash

# YourNxtWatch Deployment Script
# This script helps deploy the application manually

set -e

echo "🚀 YourNxtWatch Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build shared package
print_status "Building shared package..."
cd shared
npm run build
cd ..

# Build client
print_status "Building client..."
cd client
npm run build
cd ..

# Build server
print_status "Building server..."
cd server
npm run build
cd ..

print_status "All packages built successfully!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Install with: npm i -g vercel"
    print_warning "Skipping frontend deployment..."
else
    echo ""
    echo "🌐 Deploying Frontend to Vercel..."
    cd client
    vercel --prod
    cd ..
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Install with: npm i -g @railway/cli"
    print_warning "Skipping backend deployment..."
else
    echo ""
    echo "🚂 Deploying Backend to Railway..."
    cd server
    railway up
    cd ..
fi

echo ""
print_status "Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check your deployment URLs"
echo "2. Test the application"
echo "3. Share with friends!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 