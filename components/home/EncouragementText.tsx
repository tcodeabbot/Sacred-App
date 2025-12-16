import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getEncouragement } from '@/constants/prayers';
import { colors } from '@/constants/colors';

interface EncouragementTextProps {
  current: number;
  goal: number;
}

export function EncouragementText({ current, goal }: EncouragementTextProps) {
  const opacity = useSharedValue(1);
  const message = getEncouragement(current, goal);

  useEffect(() => {
    // Fade out and back in when message changes
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      {message}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
