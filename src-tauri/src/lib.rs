use tauri::{Manager, LogicalPosition, Position, LogicalSize, Emitter};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::menu::{Menu, MenuItem};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::io::{Read, Write};

static IS_EXPANDED: AtomicBool = AtomicBool::new(false);

static PANEL_STATE_TIMER: Mutex<String> = Mutex::new(String::new());
static PANEL_STATE_TASK: Mutex<String> = Mutex::new(String::new());

// Safely show the Tauri dashboard, positioned relative to the GNOME panel button center or screen center
fn show_dashboard(window: &tauri::WebviewWindow, btn_x: i32, btn_w: i32) {
    let dash_w = 820.0;
    let dash_h = 340.0;
    let _ = window.set_size(LogicalSize::new(dash_w, dash_h));

    let (x, y) = if btn_x > 0 {
        let center = btn_x as f64 + (btn_w as f64) / 2.0;
        ((center - dash_w / 2.0).max(10.0), 38.0)
    } else if let Ok(Some(monitor)) = window.current_monitor() {
        let scale_factor = monitor.scale_factor();
        let size = monitor.size().to_logical::<f64>(scale_factor);
        let pos = monitor.position().to_logical::<f64>(scale_factor);
        let center_x = pos.x + (size.width - dash_w) / 2.0;
        #[cfg(target_os = "windows")]
        let top_y = pos.y + 16.0;
        #[cfg(not(target_os = "windows"))]
        let top_y = pos.y + 38.0;

        (center_x.max(10.0), top_y)
    } else {
        #[cfg(target_os = "windows")]
        let top_y = 16.0;
        #[cfg(not(target_os = "windows"))]
        let top_y = 38.0;

        (550.0, top_y)
    };

    eprintln!("[Orbit Tauri] Showing dashboard at logical x={x}, y={y} (btn_x={btn_x}, btn_w={btn_w})");
    let _ = window.set_position(Position::Logical(LogicalPosition::new(x, y)));
    let _ = window.show();
    let _ = window.set_focus();
    let _ = window.set_always_on_top(true);
}

fn hide_dashboard(window: &tauri::WebviewWindow) {
    eprintln!("[Orbit Tauri] Hiding dashboard window");
    let _ = window.hide();
}

fn toggle_dashboard(window: &tauri::WebviewWindow, btn_x: i32, btn_w: i32) {
    let currently_expanded = IS_EXPANDED.load(Ordering::SeqCst);
    if currently_expanded {
        IS_EXPANDED.store(false, Ordering::SeqCst);
        hide_dashboard(window);
        let _ = window.emit("orbit-state-changed", false);
    } else {
        IS_EXPANDED.store(true, Ordering::SeqCst);
        show_dashboard(window, btn_x, btn_w);
        let _ = window.emit("orbit-state-changed", true);
    }
}

// Parse query params like "bx=500&bw=200&by=32"
fn parse_query_i32(query: &str, key: &str) -> Option<i32> {
    query.split('&').find_map(|part| {
        let mut kv = part.splitn(2, '=');
        let k = kv.next()?.trim_start_matches('?');
        let v = kv.next()?;
        if k == key { v.parse().ok() } else { None }
    })
}

#[tauri::command]
fn set_window_state(window: tauri::WebviewWindow, expanded: bool) -> Result<(), String> {
    if !expanded && IS_EXPANDED.load(Ordering::SeqCst) {
        IS_EXPANDED.store(false, Ordering::SeqCst);
        hide_dashboard(&window);
    }
    Ok(())
}

#[tauri::command]
fn toggle_orbit(window: tauri::WebviewWindow) -> Result<(), String> {
    toggle_dashboard(&window, 0, 0);
    Ok(())
}

#[tauri::command]
fn show_orbit(window: tauri::WebviewWindow) -> Result<(), String> {
    IS_EXPANDED.store(true, Ordering::SeqCst);
    show_dashboard(&window, 0, 0);
    let _ = window.emit("orbit-state-changed", true);
    Ok(())
}

#[tauri::command]
fn hide_orbit(window: tauri::WebviewWindow) -> Result<(), String> {
    IS_EXPANDED.store(false, Ordering::SeqCst);
    hide_dashboard(&window);
    let _ = window.emit("orbit-state-changed", false);
    Ok(())
}

#[tauri::command]
fn update_panel_state(timer: String, task: String) -> Result<(), String> {
    if let Ok(mut t) = PANEL_STATE_TIMER.lock() {
        *t = timer;
    }
    if let Ok(mut tk) = PANEL_STATE_TASK.lock() {
        *tk = task;
    }
    Ok(())
}

#[tauri::command]
async fn fetch_github_contributions(username: String) -> Result<String, String> {
    let clean = username.trim();
    if clean.is_empty() {
        return Err("Username cannot be empty".into());
    }

    let url = format!("https://github.com/users/{}/contributions", clean);
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("GitHub user '{}' not found (HTTP {})", clean, res.status()));
    }

    let html = res.text().await.map_err(|e| e.to_string())?;
    Ok(html)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Default initial state: empty timer, Orbit title
    if let Ok(mut t) = PANEL_STATE_TIMER.lock() {
        *t = String::new();
    }
    if let Ok(mut tk) = PANEL_STATE_TASK.lock() {
        *tk = "Orbit".to_string();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::AppleScript,
            Some(vec!["--autostart"]),
        ))
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
                eprintln!("[Orbit Tauri] Started successfully. Window hidden. IPC server on 127.0.0.1:14210.");

                // 1. Setup System Tray for Windows and Linux
                let toggle_item = MenuItem::with_id(app, "toggle", "Toggle Orbit (Ctrl+Alt+O)", true, None::<&str>).ok();
                let quit_item = MenuItem::with_id(app, "quit", "Quit Orbit", true, None::<&str>).ok();

                let tray_menu = match (&toggle_item, &quit_item) {
                    (Some(t), Some(q)) => Menu::with_items(app, &[t, q]).ok(),
                    _ => None,
                };

                let win_for_tray = window.clone();
                let mut tray_builder = TrayIconBuilder::new()
                    .tooltip("Orbit - Desktop Productivity")
                    .show_menu_on_left_click(false)
                    .on_menu_event(move |app, event| {
                        match event.id.as_ref() {
                            "toggle" => {
                                if let Some(w) = app.get_webview_window("main") {
                                    toggle_dashboard(&w, 0, 0);
                                }
                            }
                            "quit" => {
                                app.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                            toggle_dashboard(&win_for_tray, 0, 0);
                        }
                    });

                if let Some(ref menu) = tray_menu {
                    tray_builder = tray_builder.menu(menu);
                }

                if let Some(icon) = app.default_window_icon() {
                    tray_builder = tray_builder.icon(icon.clone());
                }

                if let Err(e) = tray_builder.build(app) {
                    eprintln!("[Orbit Tauri] System tray notice: {e}");
                }

                // 2. Start HTTP IPC server (127.0.0.1:14210) for GNOME extension and local automation
                let handle = window.clone();
                std::thread::spawn(move || {
                    let listener = match std::net::TcpListener::bind("127.0.0.1:14210") {
                        Ok(l) => l,
                        Err(e) => {
                            eprintln!("[Orbit Tauri] Failed to bind IPC server: {e}");
                            return;
                        }
                    };
                    eprintln!("[Orbit Tauri] IPC server listening on 127.0.0.1:14210");

                    for stream in listener.incoming() {
                        if let Ok(mut stream) = stream {
                            let mut buf = [0u8; 1024];
                            let n = stream.read(&mut buf).unwrap_or(0);
                            let req = std::str::from_utf8(&buf[..n]).unwrap_or("");

                            let first_line = req.lines().next().unwrap_or("");
                            let path_full = first_line.split_whitespace().nth(1).unwrap_or("/");
                            let (path, query) = path_full.split_once('?').unwrap_or((path_full, ""));

                            let body = if path == "/toggle" {
                                let btn_x = parse_query_i32(query, "bx").unwrap_or(0);
                                let btn_w = parse_query_i32(query, "bw").unwrap_or(200);
                                toggle_dashboard(&handle, btn_x, btn_w);
                                "OK".to_string()
                            } else if path == "/state" {
                                let timer_str = PANEL_STATE_TIMER.lock().map(|s| s.clone()).unwrap_or_default();
                                let task_str = PANEL_STATE_TASK.lock().map(|s| s.clone()).unwrap_or_else(|_| "Orbit".into());
                                format!("{{ \"timer\": \"{timer_str}\", \"task\": \"{task_str}\" }}")
                            } else {
                                "OK".to_string()
                            };

                            let response = format!(
                                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}",
                                body.len(),
                                body
                            );
                            let _ = stream.write_all(response.as_bytes());
                        }
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_window_state,
            update_panel_state,
            fetch_github_contributions,
            toggle_orbit,
            show_orbit,
            hide_orbit
        ])
        .run(tauri::generate_context!())
        .expect("error while running Orbit application");
}
