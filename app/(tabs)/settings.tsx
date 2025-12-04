import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  highlight?: boolean;
  onPress?: () => void;
}

function SettingsRow({ icon, label, value, highlight, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, highlight && styles.rowLabelHighlight]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, blockedApps, resetForDemo } = useAppStore();
  const blockedCount = blockedApps.filter((a) => a.isBlocked).length;
  
  const getDurationLabel = (seconds: number) => {
    return `${seconds / 60} min`;
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
              icon="📱"
              label="Apps to Pause"
              value={`${blockedCount} apps`}
            />
            <View style={styles.separator} />
            <SettingsRow
              icon="⏱️"
              label="Pause Duration"
              value={getDurationLabel(settings.pauseDuration)}
            />
            <View style={styles.separator} />
            <SettingsRow
              icon="🎯"
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
              icon="📖"
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
            <SettingsRow
              icon="⭐"
              label="Upgrade to Premium"
              highlight
              onPress={() => router.push('/(modals)/upgrade')}
            />
            <View style={styles.separator} />
            <SettingsRow icon="🔒" label="Privacy" />
            <View style={styles.separator} />
            <SettingsRow icon="❓" label="Help & Support" />
          </View>
        </View>
        
        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingsRow icon="ℹ️" label="About Sacred" />
            <View style={styles.separator} />
            <SettingsRow icon="⭐" label="Rate the App" />
            <View style={styles.separator} />
            <SettingsRow icon="📤" label="Share Sacred" />
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
  rowIcon: {
    fontSize: 20,
    marginRight: 14,
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
  },
  rowValue: {
    fontSize: 15,
    color: colors.text.muted,
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: colors.text.muted,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 50,
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
