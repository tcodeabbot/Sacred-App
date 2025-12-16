import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  maxSelections?: number;
}

export function TagSelector({
  tags,
  selectedTags,
  onToggleTag,
  maxSelections,
}: TagSelectorProps) {
  const handlePress = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    // Check if we can add more tags
    if (!isSelected && maxSelections && selectedTags.length >= maxSelections) {
      return;
    }

    onToggleTag(tag);
  };

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          isSelected={selectedTags.includes(tag)}
          onPress={() => handlePress(tag)}
        />
      ))}
    </View>
  );
}

interface TagChipProps {
  tag: string;
  isSelected: boolean;
  onPress: () => void;
}

function TagChip({ tag, isSelected, onPress }: TagChipProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected,
          ]}
        >
          {tag}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.teal,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
});
