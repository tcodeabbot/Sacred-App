import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function JourneyScreen() {
  const { stats, blockedApps } = useAppStore();
  const blockedCount = blockedApps.filter(a => a.isBlocked).length;

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekTotal = stats.weeklyPrayers.reduce((a, b) => a + b, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Journey</Text>

        {/* Week Chart */}
        <Card gradient={colors.gradient.brand} style={styles.chartCard}>
          <Text style={styles.chartLabel}>This Week</Text>
          <View style={styles.chartContainer}>
            {stats.weeklyPrayers.map((count, index) => {
              const maxCount = Math.max(...stats.weeklyPrayers, 1);
              const height = (count / maxCount) * 100;
              const isToday = index === new Date().getDay() - 1 || (index === 6 && new Date().getDay() === 0);
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(height, 10)}%` },
                        isToday && styles.barToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    {days[index]}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.weekTotal}>{weekTotal} prayers this week</Text>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(217,119,6,0.12)' }]}>
              <Ionicons name="flame" size={22} color={colors.accent.amber} />
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.amber }]}>
              {stats.currentStreak}
            </Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="hourglass-outline" size={22} color={colors.accent.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.primary }]}>
              {formatTime(stats.totalMinutes)}
            </Text>
            <Text style={styles.statLabel}>with God</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="leaf-outline" size={22} color={colors.accent.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text.primary }]}>
              {stats.totalPrayers}
            </Text>
            <Text style={styles.statLabel}>total pauses</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="apps-outline" size={22} color={colors.accent.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text.primary }]}>
              {blockedCount}
            </Text>
            <Text style={styles.statLabel}>apps paused</Text>
          </View>
        </View>

        {/* Longest Streak */}
        <View style={styles.longestStreakCard}>
          <View>
            <Text style={styles.longestStreakLabel}>Longest Streak</Text>
            <Text style={styles.longestStreakValue}>{stats.longestStreak} days</Text>
          </View>
          <Ionicons name="trophy-outline" size={40} color={colors.accent.amber} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 24,
  },
  chartCard: {
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 6,
    minHeight: 6,
  },
  barToday: {
    backgroundColor: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  dayLabelToday: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  weekTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  longestStreakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 24,
  },
  longestStreakLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 6,
  },
  longestStreakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
