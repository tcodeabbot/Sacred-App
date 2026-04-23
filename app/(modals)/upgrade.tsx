import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'infinite-outline', text: 'Unlimited sacred pauses' },
  { icon: 'timer-outline', text: 'Custom prayer durations' },
  { icon: 'bar-chart-outline', text: 'Detailed prayer insights' },
  { icon: 'color-palette-outline', text: 'Premium themes' },
  { icon: 'heart-outline', text: 'Support our mission' },
];

export default function UpgradeScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient.premium} style={styles.gradient}>
        {/* Ambient glow */}
        <View style={styles.glowContainer}>
          <View style={styles.glow} />
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Premium icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#F59E0B', '#D97706', '#B45309']}
                style={styles.iconGradient}
              >
                <Ionicons name="diamond-outline" size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Go Premium</Text>
            <Text style={styles.subtitle}>Unlock the full Sacred experience</Text>

            {/* Benefits */}
            <View style={styles.benefits}>
              {BENEFITS.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name={b.icon} size={20} color={colors.accent.primary} />
                  </View>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricing}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('yearly')}
                activeOpacity={0.9}
              >
                {selectedPlan === 'yearly' ? (
                  <LinearGradient
                    colors={['#1E1035', '#2D1760']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planGradient}
                  >
                    <View style={styles.planContent}>
                      <View>
                        <Text style={styles.planTitle}>Yearly</Text>
                        <Text style={styles.planPrice}>$39.99 / year</Text>
                      </View>
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveText}>Save 33%</Text>
                      </View>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.planContent}>
                    <View>
                      <Text style={styles.planTitle}>Yearly</Text>
                      <Text style={[styles.planPrice, styles.planPriceInactive]}>$39.99 / year</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, styles.planCardOutline, selectedPlan === 'monthly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.9}
              >
                <View style={styles.planContent}>
                  <View>
                    <Text style={styles.planTitle}>Monthly</Text>
                    <Text style={[styles.planPrice, styles.planPriceInactive]}>$4.99 / month</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom actions */}
          <View style={styles.actions}>
            <Button title="Start 7-Day Free Trial" onPress={() => router.back()} />
            <View style={styles.bottomLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Continue Free</Text>
              </TouchableOpacity>
            </View>
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
    top: 60,
    left: '50%',
    transform: [{ translateX: -130 }],
  },
  glow: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginBottom: 32,
  },
  benefits: {
    gap: 14,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  pricing: {
    gap: 12,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  planCardOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.6)',
  },
  planGradient: {
    padding: 20,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  planPriceInactive: {
    color: 'rgba(255,255,255,0.4)',
  },
  saveBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D1760',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 16,
  },
  linkText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
});
