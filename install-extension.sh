#!/bin/bash
# Orbit GNOME Panel Extension Installer

EXT_UUID="orbit-panel@focusisland.org"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"

echo "🛠  Installing Orbit GNOME Shell extension..."
mkdir -p "$EXT_DIR"

cp -f gnome-extension/metadata.json "$EXT_DIR/"
cp -f gnome-extension/extension.js  "$EXT_DIR/"

echo " Copied extension files to $EXT_DIR"

# Mark as enabled in dconf (GSettings)
if command -v gsettings >/dev/null 2>&1; then
  CURRENT=$(gsettings get org.gnome.shell enabled-extensions 2>/dev/null || echo "[]")
  if echo "$CURRENT" | grep -q "$EXT_UUID"; then
    echo " Extension already listed as enabled in GSettings"
  else
    NEW=$(echo "$CURRENT" | sed "s/]$/, '$EXT_UUID']/" | sed "s/\[\]$/['$EXT_UUID']/")
    gsettings set org.gnome.shell enabled-extensions "$NEW" 2>/dev/null || true
    echo " Added $EXT_UUID to enabled-extensions in GSettings"
  fi
fi

# Try enabling via gnome-extensions CLI
if command -v gnome-extensions >/dev/null 2>&1; then
  gnome-extensions enable "$EXT_UUID" 2>/dev/null && echo "✅ gnome-extensions enable OK" || true
fi

echo ""
echo "  IMPORTANT: GNOME Shell must be restarted to load the extension."
echo ""
echo "   On X11/XWayland sessions, you can restart GNOME Shell with:"
echo "   Alt + F2 → type 'r' → Enter"
echo ""
echo "   On pure Wayland: LOG OUT and LOG BACK IN to your GNOME session."
echo ""
echo "   After restarting, you should see the Orbit timer in the top panel"
echo "   next to the clock."
echo ""
echo "   Then launch the Orbit backend:"
echo "   ./run-orbit.sh"
