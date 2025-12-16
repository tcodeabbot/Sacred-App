import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { GoalPicker } from '@/components/ui/GoalPicker';
import { EncouragementText } from '@/components/home/EncouragementText';
import { StreakCard } from '@/components/home/StreakCard';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { blockedApps } from '@/constants/prayers';

export default function HomeScreen() {
  const router = useRouter();
  const { stats, todaysPrayers, settings, triggerIntercept, updateSettings } = useAppStore();
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const todayCount = todaysPrayers.length;
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const getAppInfo = (appId: string | null) => {
    return blockedApps.find((a) => a.id === appId);
  };
  
  const handlePrayNow = () => {
    // Simulate intercept with Instagram
    const instagram = blockedApps.find(a => a.id === 'instagram');
    if (instagram) {
      triggerIntercept({
        ...instagram,
        isBlocked: true,
      });
    }
    router.push('/(modals)/intercept');
  };

  const handleGoalChange = (newGoal: number) => {
    updateSettings({ dailyGoal: newGoal });
    setShowGoalPicker(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sacred</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Hero Card */}
        <Card gradient={colors.gradients.teal} style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Today's Prayers</Text>

            <EncouragementText current={todayCount} goal={settings.dailyGoal} />

            <View style={styles.progressContainer}>
              <ProgressRing
                progress={todayCount / settings.dailyGoal}
                size={180}
                strokeWidth={12}
              >
                <View style={styles.progressContent}>
                  <Text style={styles.progressNumber}>{todayCount}</Text>
                  <TouchableOpacity onPress={() => setShowGoalPicker(true)}>
                    <Text style={styles.progressGoal}>of {settings.dailyGoal}</Text>
                  </TouchableOpacity>
                </View>
              </ProgressRing>
            </View>
          </View>
        </Card>

        {/* Streak Card */}
        <StreakCard
          currentStreak={stats.currentStreak}
          bestStreak={stats.bestStreak}
          consecutiveGraceDays={stats.consecutiveGraceDays}
          maxConsecutiveGraceDays={settings.maxConsecutiveGraceDays}
          graceDaysEnabled={settings.graceDaysEnabled}
        />
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handlePrayNow}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="flower-outline" size={26} color="#F59E0B" />
            </View>
            <Text style={styles.actionTitle}>Pray Now</Text>
            <Text style={styles.actionSubtitle}>2 min</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Ionicons name="book-outline" size={26} color="#7C3AED" />
            </View>
            <Text style={styles.actionTitle}>Scripture</Text>
            <Text style={styles.actionSubtitle}>Daily verse</Text>
          </TouchableOpacity>
        </View>
        
        {/* Today's Pauses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Pauses</Text>
          
          {todaysPrayers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No prayers yet today</Text>
              <Text style={styles.emptySubtext}>Tap "Pray Now" to start</Text>
            </Card>
          ) : (
            todaysPrayers.map((prayer) => {
              const app = getAppInfo(prayer.triggeredBy);
              return (
                <View key={prayer.id} style={styles.prayerItem}>
                  <View style={styles.prayerIcon}>
                    <Ionicons
                      name={app?.icon as any || 'flower-outline'}
                      size={22}
                      color={colors.text.primary}
                    />
                  </View>
                  <View style={styles.prayerInfo}>
                    <Text style={styles.prayerTime}>{formatTime(prayer.startedAt)}</Text>
                    <Text style={styles.prayerApp}>{app?.name || 'Manual'}</Text>
                  </View>
                  <Text style={styles.prayerDuration}>
                    {Math.floor(prayer.duration / 60)} min
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Goal Picker Bottom Sheet */}
      <BottomSheet
        isVisible={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
        snapPoint={0.5}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Daily Goal</Text>
          <Text style={styles.bottomSheetSubtitle}>
            How many prayers would you like to complete daily?
          </Text>
          <GoalPicker
            value={settings.dailyGoal}
            onChange={handleGoalChange}
            min={1}
            max={20}
          />
        </View>
      </BottomSheet>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressGoal: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.muted,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  prayerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerTime: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  prayerApp: {
    fontSize: 14,
    color: colors.text.muted,
  },
  prayerDuration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
});
