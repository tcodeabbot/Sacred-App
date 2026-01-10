import { create } from 'zustand';
import { BlockedApp, PrayerSession, UserSettings, UserStats, Scripture, ScriptureReflection } from '@/types';
import { blockedApps as defaultApps, scriptures } from '@/constants/prayers';

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

  // Scripture & Reflections
  scriptureReflections: ScriptureReflection[];
  favoriteScriptures: Scripture[];
  todaysScripture: Scripture | null;
  weeklyInsight: string | null;

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

  // New actions for Phase 2
  startPrayerWithMode: (mode: 'silent' | 'scripture' | 'written', intent?: string, triggeredBy?: string) => void;
  updatePrayerJournal: (journalEntry: string) => void;
  completePrayerWithIntent: (tags?: string[]) => void;
  addScriptureReflection: (scriptureId: string, reflection: string) => void;
  toggleScriptureFavorite: (scripture: Scripture) => void;
  checkStreakWithGraceDays: () => void;
  calculateWeeklyInsight: () => void;
  setTodaysScripture: () => void;
}

const initialSettings: UserSettings = {
  pauseDuration: 120,
  dailyGoal: 5,
  frequency: 'few',
  prayerStyle: 'scripture',
  notificationsEnabled: true,
  graceDaysEnabled: true,
  maxGraceDays: 2,
  maxConsecutiveGraceDays: 1,
  prayerSchedule: [
    { id: '1', name: 'Morning Prayer', time: '07:00', duration: 5, enabled: true },
    { id: '2', name: 'Noon Prayer', time: '12:00', duration: 5, enabled: true },
    { id: '3', name: 'Evening Prayer', time: '18:00', duration: 5, enabled: true },
    { id: '4', name: 'Night Prayer', time: '21:00', duration: 5, enabled: true },
  ],
};

const initialStats: UserStats = {
  currentStreak: 7,
  longestStreak: 14,
  bestStreak: 14,
  totalPrayers: 89,
  totalMinutes: 222,
  weeklyPrayers: [3, 4, 2, 5, 4, 1, 2],
  graceDaysUsed: [],
  consecutiveGraceDays: 0,
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
    mode: 'silent',
    intent: 'Find peace before starting my day',
    tags: ['peace', 'focus'],
  },
  {
    id: '2',
    startedAt: new Date(new Date().setHours(12, 15, 0)),
    completedAt: new Date(new Date().setHours(12, 16, 0)),
    duration: 60,
    triggeredBy: 'tiktok',
    completed: true,
    mode: 'scripture',
    intent: 'Feeling stressed about work',
    tags: ['stress', 'guidance'],
  },
  {
    id: '3',
    startedAt: new Date(new Date().setHours(15, 30, 0)),
    completedAt: new Date(new Date().setHours(15, 32, 0)),
    duration: 120,
    triggeredBy: 'reddit',
    completed: true,
    mode: 'written',
    journalEntry: 'Thank you for the blessings today. Help me stay focused on what matters.',
    intent: 'Gratitude for today',
    tags: ['gratitude', 'peace'],
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

  // Scripture & Reflections
  scriptureReflections: [],
  favoriteScriptures: [],
  todaysScripture: scriptures[0], // Start with first scripture
  weeklyInsight: null,

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

  // New Phase 2 actions
  startPrayerWithMode: (mode, intent, triggeredBy) => {
    const newPrayer: PrayerSession = {
      id: Date.now().toString(),
      startedAt: new Date(),
      completedAt: null,
      duration: 0,
      triggeredBy: triggeredBy || null,
      completed: false,
      mode,
      intent,
    };
    set({ currentPrayer: newPrayer, isInterceptActive: false });
  },

  updatePrayerJournal: (journalEntry) => {
    const { currentPrayer } = get();
    if (currentPrayer) {
      set({
        currentPrayer: {
          ...currentPrayer,
          journalEntry,
        },
      });
    }
  },

  completePrayerWithIntent: (tags) => {
    const { currentPrayer, todaysPrayers, stats } = get();
    if (currentPrayer) {
      const completedPrayer: PrayerSession = {
        ...currentPrayer,
        completedAt: new Date(),
        completed: true,
        duration: Math.floor((Date.now() - currentPrayer.startedAt.getTime()) / 1000),
        tags,
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

      // Check streak and calculate weekly insight
      get().checkStreakWithGraceDays();
      get().calculateWeeklyInsight();
    }
  },

  addScriptureReflection: (scriptureId, reflection) => {
    const { scriptureReflections } = get();
    const scripture = scriptures.find(s => s.id === scriptureId);

    if (scripture) {
      const newReflection: ScriptureReflection = {
        id: Date.now().toString(),
        scriptureId,
        text: scripture.text,
        reference: scripture.reference,
        reflection,
        createdAt: new Date(),
        isFavorite: false,
      };

      set({
        scriptureReflections: [...scriptureReflections, newReflection],
      });
    }
  },

  toggleScriptureFavorite: (scripture) => {
    const { favoriteScriptures } = get();
    const isAlreadyFavorite = favoriteScriptures.some(s => s.id === scripture.id);

    if (isAlreadyFavorite) {
      set({
        favoriteScriptures: favoriteScriptures.filter(s => s.id !== scripture.id),
      });
    } else {
      set({
        favoriteScriptures: [...favoriteScriptures, scripture],
      });
    }
  },

  checkStreakWithGraceDays: () => {
    const { stats, settings, todaysPrayers } = get();
    const today = new Date().setHours(0, 0, 0, 0);

    // Get the last completed prayer
    const completedPrayers = todaysPrayers.filter(p => p.completed);
    if (completedPrayers.length === 0) return;

    const lastPrayer = completedPrayers[completedPrayers.length - 1];
    const lastPrayerDate = new Date(lastPrayer.startedAt).setHours(0, 0, 0, 0);

    const daysSinceLastPrayer = Math.floor((today - lastPrayerDate) / (1000 * 60 * 60 * 24));

    let newStats = { ...stats };

    if (daysSinceLastPrayer === 0) {
      // Prayed today, continue or start streak
      newStats.currentStreak = stats.currentStreak + 1;
      newStats.consecutiveGraceDays = 0;

      // Update best streak if current is higher
      if (newStats.currentStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.currentStreak;
        newStats.longestStreak = newStats.currentStreak;
      }
    } else if (daysSinceLastPrayer === 1 && settings.graceDaysEnabled) {
      // Missed yesterday, check grace day availability
      const newConsecutive = stats.consecutiveGraceDays + 1;

      if (newConsecutive <= settings.maxConsecutiveGraceDays) {
        // Streak continues with grace day
        newStats.consecutiveGraceDays = newConsecutive;
        newStats.graceDaysUsed = [...stats.graceDaysUsed, new Date()];
      } else {
        // Exceeded consecutive limit, reset streak
        newStats.currentStreak = 0;
        newStats.consecutiveGraceDays = 0;
      }
    } else if (daysSinceLastPrayer > 1) {
      // Missed multiple days, reset streak
      newStats.currentStreak = 0;
      newStats.consecutiveGraceDays = 0;
    }

    set({ stats: newStats });
  },

  calculateWeeklyInsight: () => {
    const { todaysPrayers } = get();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekPrayers = todaysPrayers.filter(
      p => new Date(p.startedAt) >= oneWeekAgo && p.completed
    );

    if (weekPrayers.length === 0) {
      set({ weeklyInsight: null });
      return;
    }

    // Analyze patterns
    const morningPrayers = weekPrayers.filter(
      p => new Date(p.startedAt).getHours() < 12
    );

    const tagCounts: Record<string, number> = {};
    weekPrayers.forEach(p => {
      p.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTag = Object.keys(tagCounts).length > 0
      ? Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b)
      : null;

    let insight = '';
    if (morningPrayers.length > weekPrayers.length * 0.6) {
      insight = 'You pray most during mornings this week';
    } else if (topTag) {
      insight = `This week you focused on ${topTag}`;
    } else {
      insight = `You prayed ${weekPrayers.length} times this week`;
    }

    set({ weeklyInsight: insight });
  },

  setTodaysScripture: () => {
    // Rotate through scriptures based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const scriptureIndex = dayOfYear % scriptures.length;
    set({ todaysScripture: scriptures[scriptureIndex] });
  },

  resetForDemo: () => set({
    isOnboarded: false,
    settings: initialSettings,
    blockedApps: initialBlockedApps,
    stats: initialStats,
    todaysPrayers: initialTodaysPrayers,
    currentPrayer: null,
    isInterceptActive: false,
    interceptedApp: null,
    scriptureReflections: [],
    favoriteScriptures: [],
    todaysScripture: scriptures[0],
    weeklyInsight: null,
  }),
}));
