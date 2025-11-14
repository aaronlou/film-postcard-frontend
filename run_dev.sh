#!/bin/bash

echo "🔍 Checking port 3000..."

# Find process using port 3000
PID=$(lsof -ti:3000)

if [ ! -z "$PID" ]; then
  echo "⚠️  Port 3000 is in use by process $PID"
  echo "🔪 Killing process $PID..."
  kill -9 $PID
  sleep 1
  echo "✅ Process terminated"
else
  echo "✅ Port 3000 is available"
fi

# Clean up Next.js lock file if exists
if [ -f ".next/dev/lock" ]; then
  echo "🧹 Removing Next.js lock file..."
  rm -f .next/dev/lock
fi

echo "🚀 Starting development server..."
npm run dev
