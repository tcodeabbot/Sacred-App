import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;

interface GoalPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function GoalPicker({
  value,
  onChange,
  min = 1,
  max = 20,
}: GoalPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  const numbers = Array.from(
    { length: max - min + 1 },
    (_, i) => i + min
  );

  useEffect(() => {
    // Scroll to initial value
    const index = value - min;
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newValue = numbers[index];

    if (newValue !== value) {
      onChange(newValue);
    }

    // Snap to position
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Fade */}
      <View style={[styles.fade, styles.fadeTop]} />

      {/* Selected Indicator */}
      <View style={styles.selectedIndicator} />

      {/* Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Spacer */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />

        {/* Numbers */}
        {numbers.map((number, index) => (
          <PickerItem
            key={number}
            number={number}
            index={index}
            scrollY={scrollY}
          />
        ))}

        {/* Bottom Spacer */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>

      {/* Bottom Fade */}
      <View style={[styles.fade, styles.fadeBottom]} />
    </View>
  );
}

interface PickerItemProps {
  number: number;
  index: number;
  scrollY: Animated.SharedValue<number>;
}

function PickerItem({ number, index, scrollY }: PickerItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.7, 0.85, 1, 0.85, 0.7],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 0.6, 1, 0.6, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Text style={styles.itemText}>{number}</Text>
      <Text style={styles.itemLabel}>prayers</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  scrollContent: {
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  itemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  itemLabel: {
    fontSize: 16,
    color: colors.text.muted,
  },
  selectedIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 24,
    right: 24,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accent.teal,
    opacity: 0.3,
    zIndex: 1,
    pointerEvents: 'none',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
    pointerEvents: 'none',
  },
  fadeTop: {
    top: 0,
    backgroundColor: colors.background,
    opacity: 0.9,
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: colors.background,
    opacity: 0.9,
  },
});
