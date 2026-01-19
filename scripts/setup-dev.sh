#!/bin/bash

# Kolamba Development Setup Script
# Run this script to set up your local development environment

set -e

echo "=== Kolamba Development Setup ==="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }

echo "1. Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   Created Python virtual environment"
fi

# Activate venv and install dependencies
source venv/bin/activate
pip install -r requirements.txt
echo "   Installed Python dependencies"

# Copy env file if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "   Created .env from .env.example (update with your settings)"
fi

cd ..

echo ""
echo "2. Setting up Frontend..."
cd frontend

# Install dependencies
npm install
echo "   Installed Node.js dependencies"

# Copy env file if not exists
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "   Created .env.local from .env.example"
fi

cd ..

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "To start development:"
echo ""
echo "  Backend (terminal 1):"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo ""
echo "  Frontend (terminal 2):"
echo "    cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "    docker-compose up"
echo ""
