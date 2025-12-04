import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { scriptures } from '@/constants/prayers';

const MINIMUM_PRAYER_TIME = 30; // seconds before Amen button appears

export default function ActivePrayerScreen() {
  const router = useRouter();
  const { completePrayer } = useAppStore();
  const [seconds, setSeconds] = useState(0);
  const [scriptureIndex, setScriptureIndex] = useState(0);
  
  const showAmen = seconds >= MINIMUM_PRAYER_TIME;
  const progress = Math.min(seconds / 120, 1); // 2 minutes = 100%
  
  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Change scripture every 30 seconds
  useEffect(() => {
    if (seconds > 0 && seconds % 30 === 0) {
      setScriptureIndex((i) => (i + 1) % scriptures.length);
    }
  }, [seconds]);
  
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAmen = () => {
    completePrayer();
    router.replace('/(modals)/prayer-complete');
  };
  
  const handleExtend = () => {
    // Just continue the timer
  };
  
  const currentScripture = scriptures[scriptureIndex];
  
  // Progress dots
  const progressDots = 5;
  const filledDots = Math.floor(progress * progressDots);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d0d', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Teal glow at bottom */}
        <View style={styles.glowContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(13, 148, 136, 0.3)']}
            style={styles.glow}
          />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(seconds)}</Text>
          </View>
          
          {/* Prayer content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🙏</Text>
            </View>
            
            <Animated.View
              key={scriptureIndex}
              entering={FadeIn.duration(500)}
              style={styles.scriptureContainer}
            >
              <Text style={styles.scripture}>"{currentScripture.text}"</Text>
              <Text style={styles.reference}>— {currentScripture.reference}</Text>
            </Animated.View>
          </View>
          
          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {Array.from({ length: progressDots }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < filledDots && styles.progressDotFilled,
                ]}
              />
            ))}
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            {showAmen ? (
              <Animated.View entering={FadeIn.duration(500)}>
                <Button title="Amen" onPress={handleAmen} />
              </Animated.View>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  {MINIMUM_PRAYER_TIME - seconds}s until Amen
                </Text>
              </View>
            )}
            
            <TouchableOpacity onPress={handleExtend} style={styles.extendButton}>
              <Text style={styles.extendText}>Extend prayer</Text>
            </TouchableOpacity>
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
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  glow: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconEmoji: {
    fontSize: 32,
  },
  scriptureContainer: {
    paddingHorizontal: 20,
  },
  scripture: {
    fontSize: 24,
    fontStyle: 'italic',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  reference: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotFilled: {
    backgroundColor: colors.accent.teal,
  },
  actions: {
    paddingBottom: 20,
  },
  waitingContainer: {
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  waitingText: {
    color: colors.text.muted,
    fontSize: 16,
  },
  extendButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  extendText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
});
