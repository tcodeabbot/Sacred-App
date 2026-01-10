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
  iconUri?: string; // Real app icon URL
  gradient: readonly string[];
  isBlocked: boolean;
}

export interface PrayerSession {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  duration: number;
  triggeredBy: string | null;
  completed: boolean;
  mode?: 'silent' | 'scripture' | 'written';
  journalEntry?: string;
  intent?: string;
  tags?: string[];
}

export interface PrayerScheduleItem {
  id: string;
  name: string;
  time: string; // Format: "HH:mm" (24-hour)
  duration: number; // Duration in minutes
  enabled: boolean;
}

export interface UserSettings {
  pauseDuration: number;
  dailyGoal: number;
  frequency: 'once' | 'few' | 'every';
  prayerStyle: 'scripture' | 'guided' | 'silent';
  notificationsEnabled: boolean;
  graceDaysEnabled: boolean;
  maxGraceDays: number;
  maxConsecutiveGraceDays: number;
  prayerSchedule: PrayerScheduleItem[];
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  bestStreak: number;
  totalPrayers: number;
  totalMinutes: number;
  weeklyPrayers: number[];
  graceDaysUsed: Date[];
  consecutiveGraceDays: number;
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
  whyToday?: string;
  theme?: string;
}

export interface ScriptureReflection {
  id: string;
  scriptureId: string;
  text: string;
  reference: string;
  reflection: string;
  createdAt: Date;
  isFavorite: boolean;
}

export interface ScriptureSet {
  id: string;
  title: string;
  scriptures: Scripture[];
  duration: number;
  gradient: 'teal' | 'purple' | 'amber' | 'blue' | 'pink';
}
