import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { scriptures } from '@/constants/prayers';

export default function InterceptScreen() {
  const router = useRouter();
  const { interceptedApp, startPrayer, dismissIntercept } = useAppStore();
  
  // Get random scripture
  const scripture = scriptures[Math.floor(Math.random() * scriptures.length)];
  
  // Breathing animation
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const opacity1 = useSharedValue(0.3);
  const opacity2 = useSharedValue(0.2);
  const pulseOpacity = useSharedValue(1);
  
  useEffect(() => {
    // Circle 1 animation
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // Circle 2 animation (offset)
    scale2.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity2.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // Pulse dot
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);
  
  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  
  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));
  
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));
  
  const handleBeginPrayer = () => {
    startPrayer(interceptedApp?.id);
    router.replace('/(modals)/active-prayer');
  };
  
  const handleNotNow = () => {
    dismissIntercept();
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.darkPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {/* Glowing orb effect */}
        <View style={styles.orbContainer}>
          <Animated.View style={[styles.orb, styles.orbOuter, circle1Style]} />
          <Animated.View style={[styles.orb, styles.orbInner, circle2Style]} />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          {/* Blocked app indicator */}
          {interceptedApp && (
            <View style={styles.appIndicator}>
              <View style={styles.appIcon}>
                <Text style={styles.appEmoji}>{interceptedApp.icon}</Text>
              </View>
              <Text style={styles.appName}>{interceptedApp.name}</Text>
            </View>
          )}
          
          {/* Scripture */}
          <View style={styles.content}>
            <Text style={styles.scripture}>"{scripture.text}"</Text>
            <Text style={styles.reference}>— {scripture.reference}</Text>
          </View>
          
          {/* Duration indicator */}
          <View style={styles.durationContainer}>
            <Animated.View style={[styles.pulseDot, pulseStyle]} />
            <Text style={styles.durationText}>2 minute pause</Text>
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Begin Prayer"
              onPress={handleBeginPrayer}
              style={styles.beginButton}
            />
            <TouchableOpacity onPress={handleNotNow} style={styles.notNowButton}>
              <Text style={styles.notNowText}>Not now</Text>
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
  orbContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOuter: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
  },
  orbInner: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  appIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.5,
    marginTop: 20,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appEmoji: {
    fontSize: 16,
  },
  appName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scripture: {
    fontSize: 32,
    fontStyle: 'italic',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 20,
  },
  reference: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  durationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  actions: {
    paddingBottom: 20,
  },
  beginButton: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  notNowButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  notNowText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
  },
});
