/**
 * Smoke test: handleCompletePrayer calls removeAppShield(scheduleId) and saves to Supabase.
 *
 * This test exists solely to catch regressions in the core mechanic wiring:
 *   prayer completion → apps unblock
 *
 * If this test breaks, the intercept mechanic is broken.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// --- Mocks ---

jest.mock('@/services/prayerInterruption', () => ({
  removeAppShield: jest.fn().mockResolvedValue(true),
  setAppPrayerSessionActive: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/database', () => ({
  createPrayerSession: jest.fn().mockResolvedValue({ id: 'session-1' }),
  updateUserStatsAfterPrayer: jest.fn().mockResolvedValue(undefined),
  getUserPrayerById: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/store/usePrayerStore', () => ({
  usePrayerStore: () => ({
    hideLockScreen: jest.fn(),
    currentScheduleName: 'Morning Prayer',
    currentScheduleId: 'schedule-1',
    currentPrayerId: null,
  }),
}));

jest.mock('@/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// --- Tests ---

import PrayerSession from '@/app/prayer-session';
import { removeAppShield, setAppPrayerSessionActive } from '@/services/prayerInterruption';
import { createPrayerSession, updateUserStatsAfterPrayer } from '@/lib/database';
import { useAuthStore } from '@/store/useAuthStore';

const mockUseAuthStore = useAuthStore as jest.Mock;

describe('PrayerSession — core mechanic wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated user
    mockUseAuthStore.mockReturnValue({ user: { id: 'user-123' } });
  });

  it('calls removeAppShield(scheduleId) and saves session when prayer is completed', async () => {
    const { getByText } = render(<PrayerSession />);

    fireEvent.press(getByText('Complete Prayer'));

    await waitFor(() => {
      // Session saved to Supabase
      expect(createPrayerSession).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ completed: true })
      );
      expect(updateUserStatsAfterPrayer).toHaveBeenCalledWith('user-123', expect.any(Number), expect.any(Date));

      // Apps unblocked with the correct scheduleId
      expect(removeAppShield).toHaveBeenCalledWith('schedule-1');

      // Shield extension notified that session is over
      expect(setAppPrayerSessionActive).toHaveBeenCalledWith(false);
    });
  });

  it('shows error UI and still calls removeAppShield if Supabase save throws', async () => {
    (createPrayerSession as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<PrayerSession />);
    fireEvent.press(getByText('Complete Prayer'));

    await waitFor(() => {
      expect(getByText('Could not save session')).toBeTruthy();
      // Even on error, apps are unblocked
      expect(removeAppShield).toHaveBeenCalledWith('schedule-1');
    });
  });

  it('shows error UI and does NOT call removeAppShield if user is unauthenticated', async () => {
    mockUseAuthStore.mockReturnValueOnce({ user: null });

    const { getByText } = render(<PrayerSession />);
    fireEvent.press(getByText('Complete Prayer'));

    await waitFor(() => {
      expect(getByText('Could not save session')).toBeTruthy();
    });

    // Shield stays on when unauthenticated — time fallback handles cleanup
    expect(removeAppShield).not.toHaveBeenCalled();
  });
});
