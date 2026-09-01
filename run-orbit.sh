#!/bin/bash
# Orbit Launcher Script for Linux
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🚀 Starting Orbit Dynamic Island Desktop Widget..."

export LD_LIBRARY_PATH="/usr/lib64:/usr/lib64/pulseaudio:$LD_LIBRARY_PATH"

# Check if Vite dev server is running on port 1420; if not, start it in background
if ! nc -z localhost 1420 2>/dev/null && ! curl -s http://localhost:1420 >/dev/null 2>&1; then
  echo "⚡ Launching Vite dev server on http://localhost:1420..."
  npx vite --port 1420 --strictPort >/dev/null 2>&1 &
  sleep 2
fi

exec "$DIR/src-tauri/target/debug/orbit" "$@"
