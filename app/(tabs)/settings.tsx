import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

interface SettingsRowProps {
  iconName: string;
  label: string;
  value?: string;
  highlight?: boolean;
  onPress?: () => void;
}

function SettingsRow({ iconName, label, value, highlight, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIconContainer}>
        <Ionicons name={iconName as any} size={22} color={colors.text.secondary} />
      </View>
      <Text style={[styles.rowLabel, highlight && styles.rowLabelHighlight]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, blockedApps, resetForDemo } = useAppStore();
  const { signOut, user } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const blockedCount = blockedApps.filter((a) => a.isBlocked).length;

  const getDurationLabel = (seconds: number) => {
    return `${seconds / 60} min`;
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
              router.replace('/(onboarding)');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        
        {/* Pause Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PAUSE SETTINGS</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingsRow
              iconName="apps-outline"
              label="Apps to Pause"
              value={`${blockedCount} apps`}
            />
            <View style={styles.separator} />
            <SettingsRow
              iconName="time-outline"
              label="Pause Duration"
              value={getDurationLabel(settings.pauseDuration)}
            />
            <View style={styles.separator} />
            <SettingsRow
              iconName="flag-outline"
              label="Daily Goal"
              value={`${settings.dailyGoal} times`}
            />
          </View>
        </View>
        
        {/* Prayer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PRAYER</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingsRow
              iconName="book-outline"
              label="Prayer Style"
              value={settings.prayerStyle.charAt(0).toUpperCase() + settings.prayerStyle.slice(1)}
            />
          </View>
        </View>
        
        {/* Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
          </View>
          <View style={styles.sectionContent}>
            {user && (
              <>
                <View style={styles.userInfoContainer}>
                  <View style={styles.userInfoIconContainer}>
                    <Ionicons name="person-circle-outline" size={24} color={colors.text.secondary} />
                  </View>
                  <View style={styles.userInfoText}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.user_metadata?.full_name && (
                      <Text style={styles.userDisplayName}>{user.user_metadata.full_name}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.separator} />
              </>
            )}
            <SettingsRow
              iconName="star-outline"
              label="Upgrade to Premium"
              highlight
              onPress={() => router.push('/(modals)/upgrade')}
            />
            <View style={styles.separator} />
            <SettingsRow iconName="lock-closed-outline" label="Privacy" />
            <View style={styles.separator} />
            <SettingsRow iconName="help-circle-outline" label="Help & Support" />
            <View style={styles.separator} />
            <SettingsRow
              iconName="log-out-outline"
              label={isSigningOut ? "Signing out..." : "Sign Out"}
              onPress={handleSignOut}
            />
          </View>
        </View>
        
        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingsRow iconName="information-circle-outline" label="About Sacred" />
            <View style={styles.separator} />
            <SettingsRow iconName="star-outline" label="Rate the App" />
            <View style={styles.separator} />
            <SettingsRow iconName="share-outline" label="Share Sacred" />
          </View>
        </View>
        
        {/* Demo Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetForDemo}>
          <Text style={styles.resetText}>Reset for Demo</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIconContainer: {
    width: 28,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  rowLabelHighlight: {
    color: colors.accent.amber,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: colors.text.muted,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 50,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  userInfoIconContainer: {
    width: 28,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoText: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  userDisplayName: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetText: {
    color: colors.text.muted,
    fontSize: 15,
  },
  version: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: 13,
    marginBottom: 100,
  },
});
