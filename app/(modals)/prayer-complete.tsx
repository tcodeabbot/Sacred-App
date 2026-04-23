import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function PrayerCompleteScreen() {
  const router = useRouter();
  const { stats, interceptedApp, todaysPrayers } = useAppStore();

  const lastPrayer = todaysPrayers[todaysPrayers.length - 1];
  const duration = lastPrayer ? Math.floor(lastPrayer.duration / 60) : 2;

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    checkOpacity.value = withSpring(1);
    contentOpacity.value = withDelay(300, withSpring(1));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient.complete} style={styles.gradient}>
        {/* Ambient glow */}
        <View style={styles.glowContainer}>
          <View style={styles.glow} />
        </View>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Checkmark */}
            <Animated.View style={[styles.checkContainer, checkStyle]}>
              <Ionicons name="checkmark" size={52} color="#FFFFFF" />
            </Animated.View>

            <Animated.View style={contentStyle}>
              <Text style={styles.title}>Amen</Text>
              <Text style={styles.subtitle}>{duration} minutes with God</Text>

              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: colors.accent.amber }]}>
                    {stats.currentStreak}
                  </Text>
                  <Text style={styles.statLabel}>day streak</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>
                    {todaysPrayers.length}
                  </Text>
                  <Text style={styles.statLabel}>today</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.actions}>
            <Button title="Return Home" onPress={() => router.replace('/(tabs)')} />
            {interceptedApp && (
              <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue to {interceptedApp.name}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: [{ translateX: -130 }],
  },
  glow: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(13,148,136,0.15)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actions: {
    paddingBottom: 20,
  },
  continueButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});
