#!/bin/bash

# TUMatch Quick Start Script
# This script helps you get the app running quickly

echo "🎓 TUMatch - Quick Start"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install

    if [ $? -ne 0 ]; then
        echo "❌ Installation failed!"
        exit 1
    fi

    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "The app will open at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev --host
