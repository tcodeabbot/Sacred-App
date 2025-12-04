import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { blockedApps } from '@/constants/prayers';

export default function HomeScreen() {
  const router = useRouter();
  const { stats, todaysPrayers, settings, triggerIntercept } = useAppStore();
  
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
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sacred</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconEmoji}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Hero Card */}
        <Card gradient={colors.gradients.teal} style={styles.heroCard}>
          <View style={styles.heroDecor}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
          </View>
          
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Today's Prayers</Text>
            <View style={styles.heroCount}>
              <Text style={styles.heroNumber}>{todayCount}</Text>
              <Text style={styles.heroGoal}>/ {settings.dailyGoal} goal</Text>
            </View>
            
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {stats.currentStreak} day streak</Text>
            </View>
          </View>
        </Card>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handlePrayNow}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={styles.actionEmoji}>🙏</Text>
            </View>
            <Text style={styles.actionTitle}>Pray Now</Text>
            <Text style={styles.actionSubtitle}>2 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
              <Text style={styles.actionEmoji}>📖</Text>
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
                    <Text style={styles.prayerEmoji}>{app?.icon || '🙏'}</Text>
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
  iconEmoji: {
    fontSize: 20,
  },
  heroCard: {
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecor: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  heroCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroCircle2: {
    position: 'absolute',
    top: 20,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  heroCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  heroNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroGoal: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
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
  actionEmoji: {
    fontSize: 24,
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
  prayerEmoji: {
    fontSize: 20,
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
});
