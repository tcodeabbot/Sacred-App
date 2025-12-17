import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
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
import { blockedApps } from '@/constants/prayers';
import { useAppStore } from '@/store/useAppStore';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AppCardProps {
  app: typeof blockedApps[0];
  isSelected: boolean;
  onToggle: () => void;
}

function AppCard({ app, isSelected, onToggle }: AppCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  
  return (
    <AnimatedTouchable
      style={[styles.appCard, animatedStyle, isSelected && styles.appCardSelected]}
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={app.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.appGradient}
      >
        {app.iconUri ? (
          <Image
            source={{ uri: app.iconUri }}
            style={styles.appIconImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.appIcon}>{app.icon}</Text>
        )}
        <Text style={styles.appName}>{app.name}</Text>

        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

export default function AppsScreen() {
  const router = useRouter();
  const setSelectedApps = useAppStore((state) => state.setSelectedApps);
  const [selected, setSelected] = useState<string[]>(['instagram', 'tiktok', 'reddit']);
  
  const toggleApp = (appId: string) => {
    setSelected((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };
  
  const handleContinue = () => {
    setSelectedApps(selected);
    router.push('/(onboarding)/frequency');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Which apps distract you?</Text>
        <Text style={styles.subtitle}>Sacred will pause before these open</Text>
        
        <View style={styles.grid}>
          {blockedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isSelected={selected.includes(app.id)}
              onToggle={() => toggleApp(app.id)}
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          gradient={colors.gradients.teal}
          disabled={selected.length === 0}
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
  scrollView: {
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 100,
  },
  appCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appCardSelected: {
    borderColor: colors.accent.teal,
  },
  appGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  appIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  appIconImage: {
    width: 64,
    height: 64,
    marginBottom: 8,
    borderRadius: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
});
