#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code from git..."
git pull

# Check if pull was successful
if [ $? -ne 0 ]; then
  echo "❌ Git pull failed. Aborting deployment."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building Next.js application..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# Restart application with PM2
echo "🔄 Restarting application with PM2..."

# Check if PM2 process exists
if pm2 list | grep -q "film-postcard-frontend"; then
  echo "♻️  Restarting existing PM2 process..."
  PORT=3100 pm2 restart film-postcard-frontend --update-env
else
  echo "🆕 Starting new PM2 process..."
  PORT=3100 pm2 start npm --name "film-postcard-frontend" -- start
fi

# Save PM2 configuration
pm2 save

echo "🎉 Deployment completed successfully!"
echo "📍 Application running at http://localhost:3100"
echo "💡 Check status with: pm2 status"
echo "📊 View logs with: pm2 logs film-postcard-frontend"
