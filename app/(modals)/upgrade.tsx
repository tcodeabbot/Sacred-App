import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function UpgradeScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  
  const benefits = [
    { icon: '∞', text: 'Unlimited sacred pauses' },
    { icon: '⏱️', text: 'Custom prayer durations' },
    { icon: '📊', text: 'Detailed prayer insights' },
    { icon: '🎨', text: 'Premium themes' },
    { icon: '💜', text: 'Support our mission' },
  ];
  
  const handleClose = () => {
    router.back();
  };
  
  const handleStartTrial = () => {
    // Handle subscription
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d0d', '#1a0f1f', '#2d1f3d', '#3d2952']}
        style={styles.gradient}
      >
        {/* Decorative glow */}
        <View style={styles.glowContainer}>
          <View style={styles.glow} />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Crown icon */}
            <View style={styles.crownContainer}>
              <LinearGradient
                colors={colors.gradients.amber}
                style={styles.crownGradient}
              >
                <Text style={styles.crownEmoji}>👑</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Go Premium</Text>
            <Text style={styles.subtitle}>Unlock the full Sacred experience</Text>
            
            {/* Benefits */}
            <View style={styles.benefits}>
              {benefits.map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Text style={styles.benefitEmoji}>{benefit.icon}</Text>
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              ))}
            </View>
            
            {/* Pricing */}
            <View style={styles.pricing}>
              {/* Yearly */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan('yearly')}
                activeOpacity={0.9}
              >
                {selectedPlan === 'yearly' ? (
                  <LinearGradient
                    colors={colors.gradients.purple}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planGradient}
                  >
                    <View style={styles.planContent}>
                      <View>
                        <Text style={styles.planTitle}>Yearly</Text>
                        <Text style={styles.planPrice}>$39.99/year</Text>
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
                      <Text style={[styles.planPrice, styles.planPriceInactive]}>
                        $39.99/year
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Monthly */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  styles.planCardOutline,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.9}
              >
                <View style={styles.planContent}>
                  <View>
                    <Text style={styles.planTitle}>Monthly</Text>
                    <Text style={[styles.planPrice, styles.planPriceInactive]}>
                      $4.99/month
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Bottom actions */}
          <View style={styles.actions}>
            <Button title="Start 7-Day Free Trial" onPress={handleStartTrial} />
            
            <View style={styles.bottomLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose}>
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
    transform: [{ translateX: -150 }],
  },
  glow: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
  },
  crownContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crownGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  crownEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  benefits: {
    gap: 16,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitEmoji: {
    fontSize: 18,
  },
  benefitText: {
    fontSize: 17,
    color: '#ffffff',
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
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent.purple,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  planPriceInactive: {
    color: 'rgba(255,255,255,0.5)',
  },
  saveBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.purple,
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});
