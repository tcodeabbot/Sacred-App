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
  isPremium?: boolean;
  onPress?: () => void;
}

function SettingsRow({ iconName, label, value, isPremium, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIconContainer}>
        <Ionicons
          name={iconName as any}
          size={20}
          color={isPremium ? colors.accent.amber : colors.text.secondary}
        />
      </View>
      <Text style={[styles.rowLabel, isPremium && styles.rowLabelPremium]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, blockedApps } = useAppStore();
  const { signOut, user } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const blockedCount = blockedApps.filter(a => a.isBlocked).length;

  const getDurationLabel = (seconds: number) => `${seconds / 60} min`;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSigningOut(true);
            await signOut();
            router.replace('/(onboarding)');
          } catch {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Pause Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pause Settings</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow
              iconName="apps-outline"
              label="Apps to Pause"
              value={`${blockedCount} apps`}
            />
            <View style={styles.separator} />
            <SettingsRow
              iconName="timer-outline"
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
          <Text style={styles.sectionLabel}>Prayer</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow
              iconName="calendar-outline"
              label="Prayer Schedule"
              value={`${settings.prayerSchedule.filter(p => p.enabled).length} prayers`}
              onPress={() => router.push('/(modals)/prayer-schedule')}
            />
            <View style={styles.separator} />
            <SettingsRow
              iconName="book-outline"
              label="Prayer Style"
              value={settings.prayerStyle.charAt(0).toUpperCase() + settings.prayerStyle.slice(1)}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionGroup}>
            {user && (
              <>
                <View style={styles.userRow}>
                  <View style={styles.rowIconContainer}>
                    <Ionicons name="person-circle-outline" size={20} color={colors.text.secondary} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.user_metadata?.full_name && (
                      <Text style={styles.userName}>{user.user_metadata.full_name}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.separator} />
              </>
            )}
            <SettingsRow
              iconName="diamond-outline"
              label="Upgrade to Premium"
              isPremium
              onPress={() => router.push('/(modals)/upgrade')}
            />
            <View style={styles.separator} />
            <SettingsRow iconName="lock-closed-outline" label="Privacy" />
            <View style={styles.separator} />
            <SettingsRow iconName="help-circle-outline" label="Help & Support" />
            <View style={styles.separator} />
            <SettingsRow
              iconName="log-out-outline"
              label={isSigningOut ? 'Signing out...' : 'Sign Out'}
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.sectionGroup}>
            <SettingsRow iconName="information-circle-outline" label="About Sacred" />
            <View style={styles.separator} />
            <SettingsRow iconName="star-outline" label="Rate the App" />
            <View style={styles.separator} />
            <SettingsRow iconName="share-outline" label="Share Sacred" />
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
        <View style={{ height: 100 }} />
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
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionGroup: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIconContainer: {
    width: 28,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  rowLabelPremium: {
    color: colors.accent.amber,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginLeft: 56,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  userName: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: 16,
  },
});
