use tauri::{Manager, PhysicalPosition, Position, LogicalSize, Emitter};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::io::{Read, Write};

static IS_EXPANDED: AtomicBool = AtomicBool::new(false);

static PANEL_STATE_TIMER: Mutex<String> = Mutex::new(String::new());
static PANEL_STATE_TASK: Mutex<String> = Mutex::new(String::new());

// Safely show the Tauri dashboard, positioned relative to the GNOME panel button center
fn show_dashboard(window: &tauri::WebviewWindow, btn_x: i32, btn_w: i32) {
    let dash_w = 820i32;
    let dash_h = 340i32;
    let _ = window.set_size(LogicalSize::new(dash_w as f64, dash_h as f64));

    if let Ok(Some(monitor)) = window.primary_monitor() {
        let monitor_size = monitor.size();
        let scale = monitor.scale_factor();
        let physical_dash_w = (dash_w as f64 * scale) as i32;

        let x = if btn_x > 0 {
            let center = (btn_x as f64 * scale) as i32 + ((btn_w as f64 * scale) as i32) / 2;
            (center - physical_dash_w / 2).max(0)
        } else {
            (monitor_size.width as i32 - physical_dash_w) / 2
        };

        let y = (38.0 * scale) as i32; // Directly below ~36px GNOME top bar

        eprintln!("[Orbit Tauri] Showing dashboard at physical x={x}, y={y} (btn_x={btn_x}, btn_w={btn_w})");
        let _ = window.set_position(Position::Physical(PhysicalPosition::new(x, y)));
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.set_always_on_top(true);
    }
}

fn hide_dashboard(window: &tauri::WebviewWindow) {
    eprintln!("[Orbit Tauri] Hiding dashboard window");
    let _ = window.hide();
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
fn update_panel_state(timer: String, task: String) -> Result<(), String> {
    if let Ok(mut t) = PANEL_STATE_TIMER.lock() {
        *t = timer;
    }
    if let Ok(mut tk) = PANEL_STATE_TASK.lock() {
        *tk = task;
    }
    Ok(())
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

                                let currently_expanded = IS_EXPANDED.load(Ordering::SeqCst);
                                if currently_expanded {
                                    IS_EXPANDED.store(false, Ordering::SeqCst);
                                    hide_dashboard(&handle);
                                    let _ = handle.emit("orbit-state-changed", false);
                                } else {
                                    IS_EXPANDED.store(true, Ordering::SeqCst);
                                    show_dashboard(&handle, btn_x, btn_w);
                                    let _ = handle.emit("orbit-state-changed", true);
                                }
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
        .invoke_handler(tauri::generate_handler![set_window_state, update_panel_state])
        .run(tauri::generate_context!())
        .expect("error while running Orbit application");
}
