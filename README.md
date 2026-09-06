# 🪐 Orbit

> **Minimalist Desktop Productivity Dashboard & Top-Bar Panel for GNOME**

Orbit is a fast, keyboard-friendly desktop productivity suite built specifically for Linux (GNOME Desktop). It lives directly underneath your GNOME top bar center panel, providing instant access to your daily tasks, Pomodoro focus timer, GitHub contribution graph, and scheduled reminders.

---

## ✨ Features

### 📋 Task Management
- Quick inline task creation and completion with priority tags.
- Persistent local SQLite database storage across restarts.
- Clean visual status indicators and instant keyboard interaction.

### ⏱️ Pomodoro Focus Timer
- Integrated focus timer with configurable focus/break intervals.
- Live status sync directly to the GNOME Shell top panel.
- Native desktop notifications on session completions.

### 🟩 GitHub Contribution Graph
- Displays your complete 52-week (365 days) GitHub contribution graph.
- Native Rust CORS-bypass fetching (no API token required for public profiles).
- Visual intensity streak mapping.

### ⏰ Smart Reminders & Journey Streak
- Timestamped scheduled desktop reminders.
- Activity heatmaps tracking total daily productivity score.

### ⚡ GNOME Top-Bar Integration
- Anchors directly underneath GNOME top bar center clock button.
- Fast toggle via top bar panel icon or HTTP REST IPC (`http://127.0.0.1:14210`).

---

## 🏗️ Architecture

```text
                    GNOME Shell Top Bar
                             |
                             v
                  +---------------------+
                  |     Orbit Panel     |
                  |   GNOME Extension   |
                  +----------+----------+
                             |
                        Local HTTP IPC (127.0.0.1:14210)
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
                  |  (Frameless Panel)  |
                  +----------+----------+
                             |
                  +----------+----------+
                  |                     |
                  v                     v
            Zustand Stores         SQLite DB
```

---

## 🚀 Quick Installation

Download the latest release binaries from the [**GitHub Releases Page**](https://github.com/Gaurav-Kanse/Qrbit/releases).

### 1. Install the Orbit Application

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

---

### 2. Install GNOME Shell Extension

To enable the top bar panel toggle:

#### **Automated Setup**
Clone the repository and run the installer script:
```bash
git clone https://github.com/Gaurav-Kanse/Qrbit.git
cd Qrbit
chmod +x install-extension.sh
./install-extension.sh
```

#### **Manual Setup**
1. Download `orbit-panel@focusisland.org.zip` from the [Releases Page](https://github.com/Gaurav-Kanse/Qrbit/releases).
2. Extract the archive into:
   `~/.local/share/gnome-shell/extensions/orbit-panel@focusisland.org/`
3. Enable the extension:
   ```bash
   gnome-extensions enable orbit-panel@focusisland.org
   ```

---

## 🛠️ Building from Source

### Prerequisites
- Node.js >= 18
- Rust toolchain (`rustc`, `cargo`)
- GTK3 and WebKitGTK 4.1 development files (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`)

### Development & Build
```bash
# 1. Clone repository
git clone https://github.com/Gaurav-Kanse/Qrbit.git
cd Qrbit

# 2. Install dependencies
npm install

# 3. Launch Orbit in dev mode
./run-orbit.sh

# 4. Package GNOME Extension
./scripts/bundle-extension.sh
```

## 🗑️ Uninstallation

To remove Orbit and its top panel extension from your system:

### 1. Remove GNOME Shell Extension
```bash
gnome-extensions disable orbit-panel@focusisland.org 2>/dev/null || true
rm -rf ~/.local/share/gnome-shell/extensions/orbit-panel@focusisland.org
```

### 2. Uninstall Application Package

- **AppImage**: Delete the `.AppImage` file you downloaded.
- **Debian / Ubuntu (.deb)**:
  ```bash
  sudo apt remove orbit
  ```
- **Fedora / RHEL (.rpm)**:
  ```bash
  sudo dnf remove orbit
  ```

### 3. Clear Saved Data & Settings (Optional)
```bash
rm -rf ~/.local/share/com.orbit.app
rm -rf ~/.config/com.orbit.app
```

---

## 📄 License

MIT License © 2026 Gaurav Kanse
