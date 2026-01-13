import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';

interface PrayerLockScreenProps {
  visible: boolean;
  onDismiss?: () => void;
  onStartPrayer: () => void;
  scheduleName?: string;
  blockedApps?: string[];
  duration?: number; // Duration in minutes
}

const { width, height } = Dimensions.get('window');

export function PrayerLockScreen({
  visible,
  onDismiss,
  onStartPrayer,
  scheduleName = 'Prayer Time',
  blockedApps = [],
  duration = 5, // Default 5 minutes
}: PrayerLockScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const router = useRouter();

  // Update timeLeft when duration changes
  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration, visible]);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPrayer = () => {
    onStartPrayer();
    router.push('/prayer-session');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0a4d45', '#1a9b8e', '#2dd4bf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          {onDismiss && (
            <Pressable onPress={onDismiss} style={styles.dismissButton}>
              <Ionicons name="close-circle-outline" size={28} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="hand-right" size={80} color="#fff" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Time to Pause</Text>
          <Text style={styles.subtitle}>{scheduleName}</Text>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Take a moment to step away from distractions and connect with God through prayer.
            </Text>
          </View>

          {/* Blocked Apps Indicator */}
          {blockedApps.length > 0 && (
            <View style={styles.blockedAppsContainer}>
              <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.blockedAppsText}>
                {blockedApps.length} {blockedApps.length === 1 ? 'app' : 'apps'} paused
              </Text>
            </View>
          )}

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Suggested Duration</Text>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleStartPrayer}
            >
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Begin Prayer</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </LinearGradient>
            </Pressable>

            {onDismiss && (
              <Pressable
                style={styles.secondaryButton}
                onPress={onDismiss}
              >
                <Text style={styles.secondaryButtonText}>Not Now</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Be still, and know that I am God" - Psalm 46:10
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  time: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  dismissButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  blockedAppsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  blockedAppsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  timerContainer: {
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
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
