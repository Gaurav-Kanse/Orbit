# Orbit

> **Minimalist Desktop Productivity Dashboard & Dynamic Island Panel for Linux & Windows**

Orbit is a fast, keyboard-friendly desktop productivity suite built for both **Linux (GNOME Desktop & standalone)** and **Windows**. It lives as a floating Dynamic Island panel directly accessible via global shortcuts, system tray, or the GNOME top bar, providing instant access to your daily tasks, Pomodoro focus timer, GitHub contribution graph, and scheduled reminders.

---

## Features

### Task Management
- Quick inline task creation and completion with priority tags.
- Persistent local SQLite database storage across restarts.
- Clean visual status indicators and instant keyboard interaction.

### Pomodoro Focus Timer
- Integrated focus timer with configurable focus/break intervals.
- Live status sync directly to the top panel / tray tooltip.
- Native desktop notifications on session completions.

### GitHub Contribution Graph
- Displays your complete 52-week (365 days) GitHub contribution graph.
- Native Rust CORS-bypass fetching (no API token required for public profiles).
- Visual intensity streak mapping.

### Smart Reminders & Journey Streak
- Timestamped scheduled desktop reminders.
- Activity heatmaps tracking total daily productivity score.

### Cross-Platform Desktop Integration
- **Global Keyboard Shortcut**: Press `Ctrl+Alt+O` or `Alt+Shift+O` anywhere to summon or dismiss Orbit.
- **System Tray Icon**: Lives in your Windows Taskbar / Linux notification area. Left-click to toggle, right-click for context menu.
- **GNOME Top-Bar Panel (Linux)**: Anchors directly underneath GNOME top bar center clock button.
- **Local HTTP IPC**: Fast control via HTTP REST endpoint (`http://127.0.0.1:14210/toggle`).

---

## Architecture

```text
       Linux GNOME Top Bar          Windows System Tray / Global Hotkey
              |                                     |
              | (HTTP IPC /toggle)                  | (Native Tray & Ctrl+Alt+O)
              +------------------+------------------+
                                 |
                                 v
                      +---------------------+
                      |    Tauri 2 / Rust   |
                      |       Backend       |
                      +----------+----------+
                                 |
                                 v
                      +---------------------+
                      |  React 19 + TS UI   |
                      |  (Dynamic Island)   |
                      +----------+----------+
                                 |
                      +----------+----------+
                      |                     |
                      v                     v
                Zustand Stores         SQLite DB
```

---

## Quick Installation

Download the latest release binaries from the [**GitHub Releases Page**](https://github.com/Gaurav-Kanse/Qrbit/releases).

### Windows

1. Download `Orbit_0.1.0_x64-setup.exe` or `Orbit_0.1.0_x64_en-US.msi`.
2. Run the installer and launch **Orbit**.
3. Press `Ctrl+Alt+O` or click the Orbit icon in your Windows System Tray to toggle the dashboard!

---

### Linux

Choose the package format for your Linux distribution:

#### **AppImage (Universal Linux)**
```bash
chmod +x Orbit_0.1.0_amd64.AppImage
./Orbit_0.1.0_amd64.AppImage
```

#### **Debian / Ubuntu (.deb)**
```bash
sudo dpkg -i Orbit_0.1.0_amd64.deb
```

#### **Fedora / RHEL / openSUSE (.rpm)**
```bash
sudo rpm -i Orbit-0.1.0-1.x86_64.rpm
```

#### **Optional: Install GNOME Shell Extension (for GNOME users)**
To enable the top bar panel toggle on GNOME Desktop:

##### **Automated Setup**
```bash
git clone https://github.com/Gaurav-Kanse/Qrbit.git
cd Qrbit
chmod +x install-extension.sh
./install-extension.sh
```

##### **Manual Setup**
1. Download `orbit-panel@focusisland.org.zip` from the [Releases Page](https://github.com/Gaurav-Kanse/Qrbit/releases).
2. Extract the archive into:
   `~/.local/share/gnome-shell/extensions/orbit-panel@focusisland.org/`
3. Enable the extension:
   ```bash
   gnome-extensions enable orbit-panel@focusisland.org
   ```

---

## Building from Source

### Prerequisites
- **Node.js** >= 18
- **Rust toolchain** (`rustc`, `cargo` via [rustup.rs](https://rustup.rs/))
- **Linux only**: GTK3 and WebKitGTK 4.1 development files (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`)
- **Windows only**: Visual Studio C++ Build Tools & WebView2 (included by default on Windows 10/11)

### Development & Build

#### On Windows:
```cmd
# 1. Clone repository
git clone https://github.com/Gaurav-Kanse/Qrbit.git
cd Qrbit

# 2. Install dependencies
npm install

# 3. Launch Orbit in dev mode (or run run-orbit.bat)
npm run tauri:dev

# 4. Build Windows release installer (.exe / .msi)
npm run tauri:build
```

You can also double-click `run-orbit.bat` or run `.\run-orbit.ps1` in PowerShell.

#### On Linux:
```bash
# 1. Clone repository
git clone https://github.com/Gaurav-Kanse/Qrbit.git
cd Qrbit

# 2. Install dependencies
npm install

# 3. Launch Orbit in dev mode
./run-orbit.sh

# 4. Package GNOME Extension (optional)
./scripts/bundle-extension.sh

# 5. Build Linux packages (.AppImage, .deb, .rpm)
npm run tauri:build
```

---

## Uninstallation

### Windows
- Open **Settings** > **Apps** > **Installed apps**.
- Find **Orbit** and click **Uninstall**.
- (Optional) Clear saved data: Remove `%APPDATA%\com.orbit.app`.

### Linux
1. **Remove GNOME Shell Extension** (if installed):
   ```bash
   gnome-extensions disable orbit-panel@focusisland.org 2>/dev/null || true
   rm -rf ~/.local/share/gnome-shell/extensions/orbit-panel@focusisland.org
   ```
2. **Uninstall Application Package**:
   - **AppImage**: Delete the `.AppImage` file.
   - **Debian / Ubuntu**: `sudo apt remove orbit`
   - **Fedora / RHEL**: `sudo dnf remove orbit`
3. **Clear Saved Data & Settings** (Optional):
   ```bash
   rm -rf ~/.local/share/com.orbit.app
   rm -rf ~/.config/com.orbit.app
   ```

---

## License

MIT License © 2026 Gaurav Kanse
