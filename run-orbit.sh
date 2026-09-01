#!/bin/bash
# Orbit Launcher Script for Linux
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🚀 Starting Orbit Dynamic Island Desktop Widget..."

export LD_LIBRARY_PATH="/usr/lib64:/home/gaurav/.local/lib:/home/gaurav/.local/lib/sys_symlinks:/usr/lib64/pulseaudio:$LD_LIBRARY_PATH"
export PKG_CONFIG_PATH="/usr/lib64/pkgconfig:/usr/share/pkgconfig:/home/gaurav/.local/lib/pkgconfig:$PKG_CONFIG_PATH"

# Check if Vite dev server is running on port 1420; if not, start it in background
if ! nc -z localhost 1420 2>/dev/null && ! curl -s http://localhost:1420 >/dev/null 2>&1; then
  echo "⚡ Launching Vite dev server on http://localhost:1420..."
  npx vite --port 1420 --strictPort >/dev/null 2>&1 &
  sleep 2
fi

# Prefer debug binary (latest compiled) over old release
if [ -f "$DIR/src-tauri/target/debug/orbit" ]; then
  echo "▶ Running debug binary (latest)..."
  exec "$DIR/src-tauri/target/debug/orbit" "$@"
elif [ -f "$DIR/src-tauri/target/release/orbit" ]; then
  echo "▶ Running release binary..."
  exec "$DIR/src-tauri/target/release/orbit" "$@"
fi
