import React, { useState } from 'react';
import { Bell, Plus, Check, Trash2, Calendar } from 'lucide-react';
import { useReminderStore } from '../../stores/reminderStore';

export const ReminderList: React.FC = () => {
  const { reminders, addReminder, toggleReminderCompleted, deleteReminder } = useReminderStore();
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const scheduledDate = dateStr && timeStr ? `${dateStr}T${timeStr}:00` : new Date(Date.now() + 600000).toISOString();

    addReminder(title.trim(), scheduledDate);
    setTitle('');
    setDateStr('');
    setTimeStr('');
    setIsAdding(false);
  };

  const formatScheduledTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return iso;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] rounded-2xl border border-white/10 p-3 space-y-2.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>Reminders</span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-2 bg-white/5 rounded-xl border border-white/10 space-y-2">
          <input
            type="text"
            placeholder="Reminder title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="flex-1 text-[10px] px-2 py-1 rounded-md bg-black/40 border border-white/10 text-white/80 focus:outline-none"
            />
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="flex-1 text-[10px] px-2 py-1 rounded-md bg-black/40 border border-white/10 text-white/80 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full text-xs py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
          >
            Save Reminder
          </button>
        </form>
      )}

      {/* Reminder List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[220px]">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-white/30 space-y-1">
            <Bell className="w-6 h-6 stroke-1 opacity-50" />
            <span className="text-xs">No reminders scheduled</span>
            <span className="text-[10px] opacity-70">Click + Add to set a desktop reminder</span>
          </div>
        ) : (
          reminders.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-2 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-white/[0.01] border-white/5 opacity-50'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <button
                  onClick={() => toggleReminderCompleted(item.id)}
                  className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all ${
                    item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/30 text-transparent'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-medium truncate ${item.completed ? 'line-through' : 'text-white/90'}`}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-white/40">
                    <Calendar className="w-2.5 h-2.5 text-blue-400" />
                    <span>{formatScheduledTime(item.scheduled_at)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteReminder(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
