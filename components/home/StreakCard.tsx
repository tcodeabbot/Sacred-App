import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
  consecutiveGraceDays: number;
  maxConsecutiveGraceDays: number;
  graceDaysEnabled: boolean;
}

export function StreakCard({
  currentStreak,
  bestStreak,
  consecutiveGraceDays,
  maxConsecutiveGraceDays,
  graceDaysEnabled,
}: StreakCardProps) {
  const showGraceWarning = graceDaysEnabled && consecutiveGraceDays >= maxConsecutiveGraceDays;
  const showGraceIndicator = graceDaysEnabled && consecutiveGraceDays > 0;

  return (
    <View style={styles.container}>
      <View style={styles.mainSection}>
        <View style={styles.streakRow}>
          <View style={styles.flameContainer}>
            <Ionicons name="flame" size={28} color={colors.accent.amber} />
          </View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>

        {showGraceIndicator && (
          <View style={styles.graceBadge}>
            <Text style={styles.graceBadgeText}>
              Grace day {consecutiveGraceDays}/{maxConsecutiveGraceDays}
            </Text>
          </View>
        )}

        {showGraceWarning && (
          <Text style={styles.warningText}>Pray today to keep your streak!</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.bestSection}>
        <Text style={styles.bestLabel}>Longest streak</Text>
        <Text style={styles.bestNumber}>{bestStreak} days</Text>
      </View>

      {graceDaysEnabled && (
        <Text style={styles.graceText}>"Grace renews daily"</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 24,
  },
  mainSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(217,119,6,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  graceBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderRadius: 8,
  },
  graceBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent.amber,
  },
  warningText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent.amber,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: 16,
  },
  bestSection: {
    alignItems: 'center',
  },
  bestLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bestNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  graceText: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
