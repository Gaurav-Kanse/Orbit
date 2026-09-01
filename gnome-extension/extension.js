import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class OrbitExtension extends Extension {
    enable() {
        console.log('[Orbit Extension] Enabling extension in centerBox...');

        // State
        this._timerText = '';
        this._taskText = 'Orbit';

        // Build interactive St.Button widget
        this._button = new St.Button({
            reactive: true,
            track_hover: true,
            can_focus: true,
            style_class: 'orbit-panel-button',
            style: [
                'background-color: rgba(10, 10, 14, 0.90)',
                'border: 1px solid rgba(255, 255, 255, 0.12)',
                'border-radius: 12px',
                'padding: 3px 14px',
                'border-bottom: 2px solid #3B82F6',
            ].join(';')
        });

        const box = new St.BoxLayout({
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            style: 'spacing: 7px;'
        });

        this._timerLabel = new St.Label({
            text: '◷ Orbit',
            y_align: Clutter.ActorAlign.CENTER,
            style: 'font-family: monospace; font-weight: bold; font-size: 11px; color: #60A5FA;'
        });

        box.add_child(this._timerLabel);
        this._button.set_child(box);

        // Handle clicks & presses reliably on GNOME Wayland
        const onClicked = () => {
            console.log('[Orbit Extension] Button clicked');
            this._sendToggle();
        };

        const onPress = (_actor, _event) => {
            console.log('[Orbit Extension] Button pressed');
            this._sendToggle();
            return Clutter.EVENT_STOP;
        };

        this._button.connect('clicked', onClicked);
        this._button.connect('button-press-event', onPress);

        // Insert directly into centerBox (true GNOME panel center)
        Main.panel._centerBox.insert_child_at_index(this._button, -1);

        // Poll Tauri for timer/task state every 1 second
        this._pollTimer = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 1, () => {
            this._fetchState();
            return GLib.SOURCE_CONTINUE;
        });

        console.log('[Orbit Extension] Enabled successfully in GNOME centerBox');
    }

    _sendToggle() {
        try {
            let btnX = 0;
            let btnW = 200;
            let btnY = 32;

            if (this._button) {
                const pos = this._button.get_transformed_position();
                if (pos && pos.length >= 2) {
                    btnX = Math.round(pos[0]);
                    btnY = Math.round(pos[1]);
                }
                if (this._button.width > 0) {
                    btnW = Math.round(this._button.width);
                }
            }

            const url = `http://127.0.0.1:14210/toggle?bx=${btnX}&bw=${btnW}&by=${btnY}`;
            console.log(`[Orbit Extension] Sending toggle IPC request to ${url}`);

            const proc = new Gio.Subprocess({
                argv: ['/usr/bin/curl', '-sf', '--max-time', '1', url],
                flags: Gio.SubprocessFlags.NONE,
            });
            proc.init(null);
        } catch (e) {
            console.error('[Orbit Extension] Error in _sendToggle:', e);
        }
    }

    _fetchState() {
        try {
            const url = 'http://127.0.0.1:14210/state';
            const proc = new Gio.Subprocess({
                argv: ['/usr/bin/curl', '-sf', '--max-time', '1', url],
                flags: Gio.SubprocessFlags.STDOUT_PIPE,
            });
            proc.init(null);
            proc.communicate_utf8_async(null, null, (p, res) => {
                try {
                    const [, stdout] = p.communicate_utf8_finish(res);
                    if (stdout) {
                        const data = JSON.parse(stdout);
                        let labelText = '◷ Orbit';
                        const timer = data.timer ? data.timer.trim() : '';
                        const task = data.task ? data.task.trim() : 'Orbit';

                        if (timer && timer !== '25:00') {
                            labelText = `◷ ${timer} • ${task}`;
                        } else if (task && task !== 'Orbit') {
                            labelText = `◷ ${task}`;
                        } else {
                            labelText = `◷ Orbit`;
                        }

                        if (this._timerLabel) {
                            this._timerLabel.set_text(labelText);
                        }
                    }
                } catch (_) {}
            });
        } catch (_) {}
    }

    disable() {
        if (this._pollTimer) {
            GLib.source_remove(this._pollTimer);
            this._pollTimer = null;
        }
        if (this._button) {
            Main.panel._centerBox.remove_child(this._button);
            this._button.destroy();
            this._button = null;
        }
        this._timerLabel = null;
        console.log('[Orbit Extension] Extension disabled');
    }
}
