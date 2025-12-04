import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function JourneyScreen() {
  const { stats, blockedApps } = useAppStore();
  const blockedCount = blockedApps.filter((a) => a.isBlocked).length;
  
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
        <Card gradient={colors.gradients.blue} style={styles.chartCard}>
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
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={styles.statEmoji}>🔥</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.amber }]}>
              {stats.currentStreak}
            </Text>
            <Text style={styles.statLabel}>day streak</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(13, 148, 136, 0.2)' }]}>
              <Text style={styles.statEmoji}>⏱️</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.teal }]}>
              {formatTime(stats.totalMinutes)}
            </Text>
            <Text style={styles.statLabel}>with God</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Text style={styles.statEmoji}>🙏</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.purple }]}>
              {stats.totalPrayers}
            </Text>
            <Text style={styles.statLabel}>total pauses</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={styles.statEmoji}>📱</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.accent.blue }]}>
              {blockedCount}
            </Text>
            <Text style={styles.statLabel}>apps paused</Text>
          </Card>
        </View>
        
        {/* Longest Streak */}
        <Card style={styles.longestStreak}>
          <View style={styles.longestStreakContent}>
            <Text style={styles.longestStreakLabel}>Longest Streak</Text>
            <Text style={styles.longestStreakValue}>{stats.longestStreak} days</Text>
          </View>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </Card>
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
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 24,
  },
  chartCard: {
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    minHeight: 8,
  },
  barToday: {
    backgroundColor: '#ffffff',
  },
  dayLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  dayLabelToday: {
    color: '#ffffff',
    fontWeight: '600',
  },
  weekTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.muted,
  },
  longestStreak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 100,
  },
  longestStreakContent: {},
  longestStreakLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  longestStreakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  trophyEmoji: {
    fontSize: 40,
  },
});
