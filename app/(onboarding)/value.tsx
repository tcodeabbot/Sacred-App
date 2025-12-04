import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ValueScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Purple gradient card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={colors.gradients.purple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Phone illustration */}
          <View style={styles.phoneContainer}>
            <View style={styles.phone}>
              <View style={styles.appsGrid}>
                {['📷', '🎵', '🐦', '📺', '💬', '📱'].map((icon, i) => (
                  <View key={i} style={styles.appIcon}>
                    <Text style={styles.appEmoji}>{icon}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      {/* Text content */}
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
          <Text style={styles.arrowText}>→</Text>
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
    borderRadius: 32,
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
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    justifyContent: 'center',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appEmoji: {
    fontSize: 18,
  },
  textContent: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    lineHeight: 36,
    marginBottom: 12,
  },
  highlight: {
    color: colors.accent.purple,
  },
  subtext: {
    fontSize: 17,
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
    backgroundColor: '#ffffff',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: colors.background,
  },
});
