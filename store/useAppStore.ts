import { create } from 'zustand';
import { BlockedApp, PrayerSession, UserSettings, UserStats } from '@/types';
import { blockedApps as defaultApps } from '@/constants/prayers';

interface AppState {
  // Onboarding
  isOnboarded: boolean;
  
  // Settings
  settings: UserSettings;
  blockedApps: BlockedApp[];
  
  // Stats
  stats: UserStats;
  todaysPrayers: PrayerSession[];
  
  // Current prayer state
  currentPrayer: PrayerSession | null;
  isInterceptActive: boolean;
  interceptedApp: BlockedApp | null;
  
  // Actions
  completeOnboarding: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleBlockedApp: (appId: string) => void;
  setSelectedApps: (appIds: string[]) => void;
  startPrayer: (triggeredBy?: string) => void;
  completePrayer: () => void;
  triggerIntercept: (app: BlockedApp) => void;
  dismissIntercept: () => void;
  resetForDemo: () => void;
}

const initialSettings: UserSettings = {
  pauseDuration: 120,
  dailyGoal: 5,
  frequency: 'few',
  prayerStyle: 'scripture',
  notificationsEnabled: true,
};

const initialStats: UserStats = {
  currentStreak: 7,
  longestStreak: 14,
  totalPrayers: 89,
  totalMinutes: 222,
  weeklyPrayers: [3, 4, 2, 5, 4, 1, 2],
};

const initialBlockedApps: BlockedApp[] = defaultApps.map(app => ({
  ...app,
  isBlocked: ['instagram', 'tiktok', 'reddit'].includes(app.id),
}));

const initialTodaysPrayers: PrayerSession[] = [
  {
    id: '1',
    startedAt: new Date(new Date().setHours(8, 42, 0)),
    completedAt: new Date(new Date().setHours(8, 44, 0)),
    duration: 120,
    triggeredBy: 'instagram',
    completed: true,
  },
  {
    id: '2',
    startedAt: new Date(new Date().setHours(12, 15, 0)),
    completedAt: new Date(new Date().setHours(12, 16, 0)),
    duration: 60,
    triggeredBy: 'tiktok',
    completed: true,
  },
  {
    id: '3',
    startedAt: new Date(new Date().setHours(15, 30, 0)),
    completedAt: new Date(new Date().setHours(15, 32, 0)),
    duration: 120,
    triggeredBy: 'reddit',
    completed: true,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  isOnboarded: false,
  settings: initialSettings,
  blockedApps: initialBlockedApps,
  stats: initialStats,
  todaysPrayers: initialTodaysPrayers,
  currentPrayer: null,
  isInterceptActive: false,
  interceptedApp: null,
  
  completeOnboarding: () => set({ isOnboarded: true }),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  toggleBlockedApp: (appId) => set((state) => ({
    blockedApps: state.blockedApps.map(app =>
      app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
    )
  })),
  
  setSelectedApps: (appIds) => set((state) => ({
    blockedApps: state.blockedApps.map(app => ({
      ...app,
      isBlocked: appIds.includes(app.id)
    }))
  })),
  
  startPrayer: (triggeredBy) => {
    const newPrayer: PrayerSession = {
      id: Date.now().toString(),
      startedAt: new Date(),
      completedAt: null,
      duration: 0,
      triggeredBy: triggeredBy || null,
      completed: false,
    };
    set({ currentPrayer: newPrayer, isInterceptActive: false });
  },
  
  completePrayer: () => {
    const { currentPrayer, todaysPrayers, stats } = get();
    if (currentPrayer) {
      const completedPrayer: PrayerSession = {
        ...currentPrayer,
        completedAt: new Date(),
        completed: true,
        duration: Math.floor((Date.now() - currentPrayer.startedAt.getTime()) / 1000),
      };
      
      set({
        currentPrayer: null,
        todaysPrayers: [...todaysPrayers, completedPrayer],
        stats: {
          ...stats,
          totalPrayers: stats.totalPrayers + 1,
          totalMinutes: stats.totalMinutes + Math.floor(completedPrayer.duration / 60),
        },
        interceptedApp: null,
      });
    }
  },
  
  triggerIntercept: (app) => set({
    isInterceptActive: true,
    interceptedApp: app,
  }),
  
  dismissIntercept: () => set({
    isInterceptActive: false,
    interceptedApp: null,
  }),
  
  resetForDemo: () => set({
    isOnboarded: false,
    settings: initialSettings,
    blockedApps: initialBlockedApps,
    stats: initialStats,
    todaysPrayers: initialTodaysPrayers,
    currentPrayer: null,
    isInterceptActive: false,
    interceptedApp: null,
  }),
}));
