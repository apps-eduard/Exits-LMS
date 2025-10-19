#!/bin/bash
# Restart Backend Server

echo "🛑 Stopping backend server..."
pkill -f "node server.js" || echo "No process found"

sleep 2

echo "🚀 Starting backend server..."
cd "$(dirname "$0")"
npm start

