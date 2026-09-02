# Orbit

A lightweight Linux productivity workspace built around the GNOME desktop.

Orbit combines task management, Pomodoro focus sessions, reminders, productivity tracking, and GitHub activity into a single desktop interface accessible directly from the GNOME top panel.

![Orbit Preview](assets/orbit-preview.png)

## Overview

Orbit is designed to keep productivity tools available without requiring a separate full-screen application.

The application runs as a Tauri desktop app with a React and TypeScript frontend, while a GNOME Shell extension provides the top-panel integration. The panel displays the current focus timer and active task and can be used to open the main Orbit workspace.

The goal is simple: keep the tools needed for focused work close to the desktop without adding unnecessary complexity.

## Features

### Task Management

- Create and manage tasks
- Task descriptions and priorities
- Mark tasks as completed
- Edit and delete tasks
- Reorder tasks
- Persistent local storage

### Focus Timer

Orbit includes a built-in Pomodoro workflow.

- 25-minute focus sessions by default
- 5-minute short breaks
- 15-minute long breaks
- Automatic transition between focus and break sessions
- Long break after every fourth completed focus session
- Completed focus sessions are tracked
- Desktop notifications when sessions finish
- Configurable timer durations

### Reminders

Create desktop reminders directly from Orbit.

- Custom reminder titles
- Date and time scheduling
- Completion tracking
- Delete reminders
- Native desktop notifications

### Journey Streak

Orbit tracks productivity activity locally and visualizes it through a contribution-style heatmap.

Activity is calculated from:

- Completed tasks
- Completed focus sessions
- Recent activity history

The dashboard also calculates the current consecutive activity streak.

### GitHub Integration

Orbit can display a user's public GitHub contribution activity.

Enter a GitHub username to load:

- Contribution history
- Total contributions over the last year
- 52-week contribution calendar
- Contribution intensity visualization

No GitHub authentication token is required for the current public contribution view.

### GNOME Panel Integration

Orbit integrates directly with the GNOME Shell top panel.

The panel widget provides:

- Current focus timer
- Active task
- Quick access to the Orbit workspace
- Live timer/task state

The GNOME extension communicates with the Tauri application through a local HTTP IPC interface.

## Architecture

```text
                    GNOME Shell
                         |
                         v
              +---------------------+
              |   Orbit Panel       |
              |   GNOME Extension   |
              +----------+----------+
                         |
                    Local HTTP IPC
                         |
                         v
              +---------------------+
              |   Tauri / Rust      |
              |      Backend        |
              +----------+----------+
                         |
                         v
              +---------------------+
              | React + TypeScript  |
              |     Frontend        |
              +----------+----------+
                         |
              +----------+----------+
              |                     |
              v                     v
        Zustand Stores          SQLite
              |                     |
              +----------+----------+
                         |
                    Local Data
