#!/bin/bash

# Production startup script for School Attendance Backend

echo "🚀 Starting School Attendance Backend in production mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
    echo "   Copy env.example to .env and update with your production values."
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Set production environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export ENVIRONMENT=production

# Start the server
echo "🌐 Starting server..."
echo "   Host: ${HOST:-0.0.0.0}"
echo "   Port: ${PORT:-8000}"
echo "   Frontend URL: ${FRONTEND_URL:-Not configured}"

# Use gunicorn for production (if available) or fallback to uvicorn
if command -v gunicorn &> /dev/null; then
    echo "🦄 Using Gunicorn with Uvicorn workers..."
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
else
    echo "⚡ Using Uvicorn directly..."
    uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4
fi 