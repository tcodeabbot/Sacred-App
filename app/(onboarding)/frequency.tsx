import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OptionProps {
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

function Option({ title, description, icon, isSelected, onSelect }: OptionProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  
  const content = (
    <>
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
          {description}
        </Text>
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </>
  );
  
  if (isSelected) {
    return (
      <AnimatedTouchable
        style={animatedStyle}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={colors.gradients.teal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.option}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }
  
  return (
    <AnimatedTouchable
      style={[styles.option, styles.optionUnselected, animatedStyle]}
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {content}
    </AnimatedTouchable>
  );
}

export default function FrequencyScreen() {
  const router = useRouter();
  const { updateSettings, completeOnboarding } = useAppStore();
  const [selected, setSelected] = useState<'once' | 'few' | 'every'>('few');
  
  const options = [
    {
      id: 'once' as const,
      title: 'Once daily',
      description: 'A single intentional moment',
      icon: '☀️',
    },
    {
      id: 'few' as const,
      title: 'A few times',
      description: 'Brief pauses throughout the day',
      icon: '🌤️',
    },
    {
      id: 'every' as const,
      title: 'Every time',
      description: 'Transform each interruption',
      icon: '✨',
    },
  ];
  
  const handleSetup = () => {
    updateSettings({ frequency: selected });
    completeOnboarding();
    router.replace('/(tabs)');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How often to pause?</Text>
        <Text style={styles.subtitle}>Choose what feels right for you</Text>
        
        <View style={styles.options}>
          {options.map((option) => (
            <Option
              key={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              isSelected={selected === option.id}
              onSelect={() => setSelected(option.id)}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Set Up Sacred"
          onPress={handleSetup}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  optionUnselected: {
    backgroundColor: colors.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  optionDescriptionSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.teal,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
});
