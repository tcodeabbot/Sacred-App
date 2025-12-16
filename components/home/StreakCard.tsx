import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={colors.gradients.amber}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Current Streak */}
        <View style={styles.mainSection}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={36} color="#F59E0B" />
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
            <Text style={styles.warningText}>
              Pray today to keep your streak!
            </Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Best Streak */}
        <View style={styles.bestSection}>
          <Text style={styles.bestLabel}>Your longest streak</Text>
          <Text style={styles.bestNumber}>{bestStreak} days</Text>
        </View>

        {/* Biblical framing */}
        {graceDaysEnabled && (
          <Text style={styles.graceText}>
            "Grace renews daily"
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 24,
  },
  content: {
    padding: 20,
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
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  graceBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  graceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  warningText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 16,
  },
  bestSection: {
    alignItems: 'center',
  },
  bestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  bestNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  graceText: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
