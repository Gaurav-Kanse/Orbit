export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  created_at: string;
  completed_at?: string | null;
  due_date?: string | null;
  position: number;
}

export interface FocusSession {
  id: string;
  todo_id?: string | null;
  started_at: string;
  ended_at: string;
  duration: number; // in seconds or minutes
  completed: boolean;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  tasks_completed: number;
  focus_minutes: number;
  focus_sessions: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = none, 4 = highest
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface GithubUserData {
  username: string;
  avatarUrl?: string;
  totalContributions: number;
  weeks: ContributionWeek[];
  lastFetched?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string; // e.g. '#3B82F6'
  widgetOpacity: number; // 0.8 - 1.0
  cornerRadius: number; // px border radius
  animationEnabled: boolean;
  
  // Collapsed view options
  collapsedShowTimer: boolean;
  collapsedShowTask: boolean;
  collapsedShowStreak: boolean;
  collapsedShowGithub: boolean;

  // Expanded view sections
  expandedShowTodo: boolean;
  expandedShowGithub: boolean;
  expandedShowJourney: boolean;
  expandedShowStats: boolean;

  // Window position & system
  position: 'top-center' | 'custom';
  customOffset: number;
  alwaysOnTop: boolean;
  launchOnStartup: boolean;

  // Timer defaults (in minutes)
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}
