import { create } from 'zustand';
import {
  PrayerSchedule,
  schedulePrayerNotification,
  cancelPrayerNotification,
  scheduleAllPrayers,
  requestNotificationPermissions,
} from '@/services/notificationService';

interface PrayerState {
  // Prayer Lock Screen
  isLockScreenVisible: boolean;
  currentScheduleName: string | null;
  currentPrayerId: string | null; // ID of the selected user prayer to display

  // Prayer Schedules
  schedules: PrayerSchedule[];
  notificationIds: Record<string, string>; // scheduleId -> notificationId

  // Actions
  showLockScreen: (scheduleName?: string, prayerId?: string) => void;
  hideLockScreen: () => void;

  // Schedule management
  addSchedule: (schedule: Omit<PrayerSchedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<PrayerSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  syncSchedules: () => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;
}

const DEFAULT_SCHEDULES: PrayerSchedule[] = [
  {
    id: '1',
    time: '07:00',
    days: [0, 1, 2, 3, 4, 5, 6], // Every day
    enabled: true,
    label: 'Morning Prayer',
  },
  {
    id: '2',
    time: '12:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: false,
    label: 'Midday Prayer',
  },
  {
    id: '3',
    time: '21:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    label: 'Evening Prayer',
  },
];

export const usePrayerStore = create<PrayerState>((set, get) => ({
  isLockScreenVisible: false,
  currentScheduleName: null,
  currentPrayerId: null,
  schedules: DEFAULT_SCHEDULES,
  notificationIds: {},

  showLockScreen: (scheduleName, prayerId) => {
    set({
      isLockScreenVisible: true,
      currentScheduleName: scheduleName || 'Prayer Time',
      currentPrayerId: prayerId || null,
    });
  },

  hideLockScreen: () => {
    set({
      isLockScreenVisible: false,
      currentScheduleName: null,
      currentPrayerId: null,
    });
  },

  addSchedule: async (schedule) => {
    const newSchedule: PrayerSchedule = {
      ...schedule,
      id: Date.now().toString(),
    };

    set((state) => ({
      schedules: [...state.schedules, newSchedule],
    }));

    // Schedule notification if enabled
    if (newSchedule.enabled) {
      const notificationId = await schedulePrayerNotification(newSchedule);
      if (notificationId) {
        set((state) => ({
          notificationIds: {
            ...state.notificationIds,
            [newSchedule.id]: notificationId,
          },
        }));
      }
    }
  },

  updateSchedule: async (id, updates) => {
    const state = get();
    const schedule = state.schedules.find((s) => s.id === id);
    if (!schedule) return;

    const updatedSchedule = { ...schedule, ...updates };

    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? updatedSchedule : s
      ),
    }));

    // Cancel old notification
    const oldNotificationId = state.notificationIds[id];
    if (oldNotificationId) {
      await cancelPrayerNotification(oldNotificationId);
    }

    // Schedule new notification if enabled
    if (updatedSchedule.enabled) {
      const notificationId = await schedulePrayerNotification(updatedSchedule);
      if (notificationId) {
        set((state) => ({
          notificationIds: {
            ...state.notificationIds,
            [id]: notificationId,
          },
        }));
      }
    } else {
      // Remove notification ID if disabled
      set((state) => {
        const { [id]: removed, ...rest } = state.notificationIds;
        return { notificationIds: rest };
      });
    }
  },

  deleteSchedule: async (id) => {
    const state = get();

    // Cancel notification
    const notificationId = state.notificationIds[id];
    if (notificationId) {
      await cancelPrayerNotification(notificationId);
    }

    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
      notificationIds: Object.fromEntries(
        Object.entries(state.notificationIds).filter(([key]) => key !== id)
      ),
    }));
  },

  toggleSchedule: async (id) => {
    const state = get();
    const schedule = state.schedules.find((s) => s.id === id);
    if (!schedule) return;

    await get().updateSchedule(id, { enabled: !schedule.enabled });
  },

  syncSchedules: async () => {
    const state = get();
    const ids = await scheduleAllPrayers(state.schedules);
    set({ notificationIds: ids });
  },

  initialize: async () => {
    // Request notification permissions
    const granted = await requestNotificationPermissions();

    if (granted) {
      // Sync all schedules
      await get().syncSchedules();
      console.log('Prayer schedules initialized');
    } else {
      console.warn('Notification permissions not granted, schedules not initialized');
    }
  },
}));
