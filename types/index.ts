export interface User {
  id: string;
  name: string;
  email?: string;
  isPremium: boolean;
  createdAt: Date;
}

export interface BlockedApp {
  id: string;
  name: string;
  icon: string;
  gradient: string[];
  isBlocked: boolean;
}

export interface PrayerSession {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  duration: number;
  triggeredBy: string | null;
  completed: boolean;
}

export interface UserSettings {
  pauseDuration: number;
  dailyGoal: number;
  frequency: 'once' | 'few' | 'every';
  prayerStyle: 'scripture' | 'guided' | 'silent';
  notificationsEnabled: boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalPrayers: number;
  totalMinutes: number;
  weeklyPrayers: number[];
}

export interface Prayer {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  gradient: 'teal' | 'purple' | 'amber' | 'blue' | 'pink';
}

export interface Scripture {
  id: string;
  text: string;
  reference: string;
}
