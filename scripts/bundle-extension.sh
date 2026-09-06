#!/bin/bash
set -e

EXT_UUID="orbit-panel@focusisland.org"
DIST_DIR="dist-release"
ZIP_NAME="${EXT_UUID}.zip"

echo "📦 Packaging GNOME Shell Extension ($EXT_UUID)..."

mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"

cd gnome-extension
zip -r "../$DIST_DIR/$ZIP_NAME" metadata.json extension.js
cd ..

echo "✅ Bundled extension into $DIST_DIR/$ZIP_NAME"
