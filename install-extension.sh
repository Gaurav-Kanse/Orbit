#!/bin/bash
# Install and reload Orbit GNOME Shell Extension
set -e

EXT_UUID="orbit-panel@focusisland.org"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"

echo "🛠  Installing Orbit GNOME Shell extension ($EXT_UUID)..."

mkdir -p "$EXT_DIR"
cp -r gnome-extension/* "$EXT_DIR/"

echo "🔄 Reloading extension in GNOME Shell..."

# Toggle off then on to force GNOME Shell to reload module from disk
gnome-extensions disable "$EXT_UUID" 2>/dev/null || true
sleep 1
gnome-extensions enable "$EXT_UUID" 2>/dev/null || true

# Eval reload if supported
busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s "Main.ExtensionManager.reloadExtension(Main.ExtensionManager.lookup('$EXT_UUID'))" 2>/dev/null || true

echo "✅ Orbit GNOME Shell extension installed and reloaded!"
