import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { EncouragementText } from '@/components/home/EncouragementText';
import { StreakCard } from '@/components/home/StreakCard';
import { NextPrayer } from '@/components/home/NextPrayer';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { QuickScheduleSheet } from '@/components/home/QuickScheduleSheet';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { usePrayerStore } from '@/store/usePrayerStore';
import { blockedApps } from '@/constants/prayers';

export default function HomeScreen() {
  const router = useRouter();
  const { stats, todaysPrayers, settings, triggerIntercept, updateSettings } = useAppStore();
  const { showLockScreen } = usePrayerStore();
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);

  const todayCount = todaysPrayers.length;
  const scheduledPrayersGoal = settings.prayerSchedule.filter(p => p.enabled).length;

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
    const instagram = blockedApps.find(a => a.id === 'instagram');
    if (instagram) {
      triggerIntercept({ ...instagram, isBlocked: true });
    }
    router.push('/(modals)/intercept');
  };

  const handleQuickScheduleSave = (time: string, name: string, repeatType: 'once' | 'daily') => {
    if (repeatType === 'daily') {
      const newId = (settings.prayerSchedule.length + 1).toString();
      updateSettings({
        prayerSchedule: [...settings.prayerSchedule, { id: newId, name, time, enabled: true, duration: 5 }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sacred</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Prayer */}
        <NextPrayer prayerSchedule={settings.prayerSchedule} />

        {/* Hero Card */}
        <Card gradient={colors.gradient.brand} style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Today's Prayers</Text>
            <EncouragementText current={todayCount} goal={scheduledPrayersGoal} />
            <View style={styles.progressContainer}>
              <ProgressRing
                progress={scheduledPrayersGoal > 0 ? todayCount / scheduledPrayersGoal : 0}
                size={180}
                strokeWidth={12}
              >
                <View style={styles.progressContent}>
                  <Text style={styles.progressNumber}>{todayCount}</Text>
                  <TouchableOpacity onPress={() => router.push('/(modals)/prayer-schedule')}>
                    <Text style={styles.progressGoal}>
                      of {scheduledPrayersGoal} {scheduledPrayersGoal === 1 ? 'prayer' : 'prayers'}
                    </Text>
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
            <View style={[styles.actionIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="leaf-outline" size={24} color={colors.accent.primary} />
            </View>
            <Text style={styles.actionTitle}>Pray Now</Text>
            <Text style={styles.actionSubtitle}>2 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              const firstScheduledPrayer = settings.prayerSchedule.find(p => p.enabled);
              showLockScreen(
                firstScheduledPrayer?.name || 'Prayer Time',
                firstScheduledPrayer?.selectedPrayerId,
                firstScheduledPrayer?.duration || 5
              );
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="shield-outline" size={24} color={colors.accent.primary} />
            </View>
            <Text style={styles.actionTitle}>Test Lock</Text>
            <Text style={styles.actionSubtitle}>Try it</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/prayers')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accent.primaryLight }]}>
              <Ionicons name="book-outline" size={24} color={colors.accent.primary} />
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
                    {app?.iconUri ? (
                      <Image source={{ uri: app.iconUri }} style={styles.prayerIconImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="leaf-outline" size={20} color={colors.text.secondary} />
                    )}
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

      <QuickScheduleSheet
        isVisible={showQuickSchedule}
        onClose={() => setShowQuickSchedule(false)}
        onSave={handleQuickScheduleSave}
      />

      <FloatingActionButton
        onPress={() => router.push('/(modals)/prayer-schedule')}
        icon="time-outline"
      />
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
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
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
    fontWeight: '700',
    color: '#ffffff',
  },
  progressGoal: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
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
    color: colors.text.tertiary,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  prayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  prayerIconImage: {
    width: 40,
    height: 40,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerTime: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  prayerApp: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  prayerDuration: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
