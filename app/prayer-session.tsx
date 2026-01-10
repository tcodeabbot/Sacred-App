import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePrayerStore } from '@/store/usePrayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPrayer } from '@/types';
import { createPrayerSession, updateUserStatsAfterPrayer, getUserPrayerById } from '@/lib/database';

export default function PrayerSession() {
  const router = useRouter();
  const { hideLockScreen, currentScheduleName, currentPrayerId } = usePrayerStore();
  const { user } = useAuthStore();

  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mode, setMode] = useState<'silent' | 'scripture' | 'written'>('silent');
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<UserPrayer | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Fetch selected prayer if one is set
  useEffect(() => {
    const fetchPrayer = async () => {
      if (currentPrayerId) {
        try {
          const prayer = await getUserPrayerById(currentPrayerId);
          setSelectedPrayer(prayer);
          // Auto-switch to scripture mode if a prayer is selected
          setMode('scripture');
        } catch (error) {
          console.error('Error fetching selected prayer:', error);
        }
      }
    };
    fetchPrayer();
  }, [currentPrayerId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompletePrayer = async () => {
    if (!user) return;

    const duration = Math.floor(elapsedTime / 60);
    const now = new Date();

    try {
      // Save prayer session
      await createPrayerSession(user.id, {
        startedAt: startTime,
        completedAt: now,
        duration,
        triggeredBy: currentScheduleName,
        completed: true,
        mode,
        tags: [],
      });

      // Update user stats
      await updateUserStatsAfterPrayer(user.id, duration, now);

      setIsComplete(true);

      // Navigate back after showing success
      setTimeout(() => {
        hideLockScreen();
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error saving prayer session:', error);
    }
  };

  const handleSkip = () => {
    hideLockScreen();
    router.back();
  };

  if (isComplete) {
    return (
      <LinearGradient
        colors={['#0a4d45', '#1a9b8e']}
        style={styles.container}
      >
        <View style={styles.completeContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#fff" />
          <Text style={styles.completeTitle}>Prayer Complete!</Text>
          <Text style={styles.completeSubtitle}>
            You spent {formatTime(elapsedTime)} in prayer
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a4d45', '#1a9b8e', '#2dd4bf']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleSkip}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>{currentScheduleName || 'Prayer Time'}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Timer */}
          <View style={styles.timerSection}>
            <Text style={styles.timerLabel}>Time in Prayer</Text>
            <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
          </View>

          {/* Mode Selection */}
          <View style={styles.modeSection}>
            <Text style={styles.sectionTitle}>Prayer Mode</Text>
            <View style={styles.modeButtons}>
              <Pressable
                style={[styles.modeButton, mode === 'silent' && styles.modeButtonActive]}
                onPress={() => setMode('silent')}
              >
                <Ionicons
                  name="volume-mute"
                  size={24}
                  color={mode === 'silent' ? colors.primary : '#fff'}
                />
                <Text style={[styles.modeButtonText, mode === 'silent' && styles.modeButtonTextActive]}>
                  Silent
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modeButton, mode === 'scripture' && styles.modeButtonActive]}
                onPress={() => setMode('scripture')}
              >
                <Ionicons
                  name="book"
                  size={24}
                  color={mode === 'scripture' ? colors.primary : '#fff'}
                />
                <Text style={[styles.modeButtonText, mode === 'scripture' && styles.modeButtonTextActive]}>
                  Scripture
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modeButton, mode === 'written' && styles.modeButtonActive]}
                onPress={() => setMode('written')}
              >
                <Ionicons
                  name="create"
                  size={24}
                  color={mode === 'written' ? colors.primary : '#fff'}
                />
                <Text style={[styles.modeButtonText, mode === 'written' && styles.modeButtonTextActive]}>
                  Journal
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Prayer Content */}
          <View style={styles.contentSection}>
            {mode === 'silent' && (
              <View style={styles.silentMode}>
                <Ionicons name="hand-right" size={60} color="rgba(255,255,255,0.8)" />
                <Text style={styles.silentModeText}>
                  Take this time to pray in silence. Focus on God's presence and let your thoughts become prayers.
                </Text>
              </View>
            )}

            {mode === 'scripture' && (
              <View style={styles.scriptureMode}>
                {selectedPrayer ? (
                  <>
                    <Text style={styles.prayerTitle}>{selectedPrayer.title}</Text>
                    <Text style={styles.scriptureText}>
                      {selectedPrayer.fullText || selectedPrayer.excerpt}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.scriptureText}>
                      "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
                    </Text>
                    <Text style={styles.scriptureReference}>Philippians 4:6</Text>
                  </>
                )}
              </View>
            )}

            {mode === 'written' && (
              <View style={styles.writtenMode}>
                <Text style={styles.writtenModeText}>
                  Journal mode coming soon...
                </Text>
              </View>
            )}
          </View>

          {/* Complete Button */}
          <Pressable
            style={styles.completeButton}
            onPress={handleCompletePrayer}
          >
            <LinearGradient
              colors={['#fff', '#f0f0f0']}
              style={styles.completeButtonGradient}
            >
              <Text style={styles.completeButtonText}>Complete Prayer</Text>
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  modeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  modeButtonTextActive: {
    color: colors.primary,
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    justifyContent: 'center',
  },
  silentMode: {
    alignItems: 'center',
    gap: 20,
  },
  silentModeText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scriptureMode: {
    gap: 16,
  },
  prayerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  scriptureText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scriptureReference: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  writtenMode: {
    alignItems: 'center',
  },
  writtenModeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  completeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
});
