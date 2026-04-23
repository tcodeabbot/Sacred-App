import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

const APP_PLACEHOLDERS = [
  { opacity: 0.6 }, { opacity: 0.4 }, { opacity: 0.5 },
  { opacity: 0.3 }, { opacity: 0.5 }, { opacity: 0.4 },
];

export default function ValueScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Card illustration */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={colors.gradient.intercept}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.phoneContainer}>
            <View style={styles.phone}>
              <View style={styles.appsGrid}>
                {APP_PLACEHOLDERS.map((p, i) => (
                  <View key={i} style={[styles.appPlaceholder, { opacity: p.opacity }]} />
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Text */}
      <View style={styles.textContent}>
        <Text style={styles.headline}>
          Your phone steals{' '}
          <Text style={styles.highlight}>hundreds</Text>
          {' '}of moments each day
        </Text>
        <Text style={styles.subtext}>
          What if each interruption became an invitation to pray?
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => router.push('/(onboarding)/apps')}
        >
          <Ionicons name="arrow-forward" size={22} color={colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  cardContainer: {
    flex: 1,
    marginTop: 20,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '70%',
  },
  phoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 140,
    height: 250,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    justifyContent: 'center',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  appPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  textContent: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 36,
    marginBottom: 12,
  },
  highlight: {
    color: colors.accent.primary,
  },
  subtext: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.text.primary,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
