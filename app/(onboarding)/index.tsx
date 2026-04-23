import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1, false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1, false
    );
  }, []);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient.brand} style={styles.gradientTop}>
        <SafeAreaView style={styles.topContent}>
          {/* Breathing circles */}
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.circle, styles.circleOuter, breathingStyle]} />
            <Animated.View style={[styles.circle, styles.circleMiddle, breathingStyle]} />
            <Animated.View style={[styles.circle, styles.circleInner]} />
          </View>

          {/* Cross logotype */}
          <View style={styles.iconContainer}>
            <Text style={styles.cross}>✝</Text>
          </View>

          <Text style={styles.title}>Sacred</Text>
          <Text style={styles.subtitle}>Transform distraction into devotion</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottomSection}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/sign-in')}
        />

        <TouchableOpacity onPress={() => router.push('/(onboarding)/sign-in')}>
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientTop: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circleContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  circleOuter: {
    width: 220,
    height: 220,
  },
  circleMiddle: {
    width: 165,
    height: 165,
  },
  circleInner: {
    width: 110,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cross: {
    fontSize: 38,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  bottomSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 16,
  },
  signInText: {
    color: colors.text.tertiary,
    textAlign: 'center',
    fontSize: 14,
  },
  signInLink: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
});
