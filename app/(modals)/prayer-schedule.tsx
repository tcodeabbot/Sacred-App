import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { PrayerScheduleItem } from '@/types';

export default function PrayerScheduleScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [tempName, setTempName] = useState('');

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleTogglePrayer = (prayerId: string) => {
    const updatedSchedule = settings.prayerSchedule.map(prayer =>
      prayer.id === prayerId ? { ...prayer, enabled: !prayer.enabled } : prayer
    );
    updateSettings({ prayerSchedule: updatedSchedule });
  };

  const handleNamePress = (prayer: PrayerScheduleItem) => {
    setTempName(prayer.name);
    setEditingName(prayer.id);
  };

  const handleNameChange = (prayerId: string, newName: string) => {
    if (newName.trim()) {
      const updatedSchedule = settings.prayerSchedule.map(prayer =>
        prayer.id === prayerId ? { ...prayer, name: newName.trim() } : prayer
      );
      updateSettings({ prayerSchedule: updatedSchedule });
    }
    setEditingName(null);
    setTempName('');
  };

  const handleTimePress = (prayer: PrayerScheduleItem) => {
    try {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      setTempTime(date);
      setEditingTime(prayer.id);
    } catch (error) {
      console.error('Error parsing time:', error);
      Alert.alert('Error', 'Failed to open time picker');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, dismiss picker after selection
    if (Platform.OS === 'android') {
      setEditingTime(null);
    }

    // Handle time change
    if (selectedDate && editingTime) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;

      const updatedSchedule = settings.prayerSchedule.map(prayer =>
        prayer.id === editingTime ? { ...prayer, time: newTime } : prayer
      );
      updateSettings({ prayerSchedule: updatedSchedule });

      // On iOS, keep picker open and update temp time
      if (Platform.OS === 'ios') {
        setTempTime(selectedDate);
      }
    }
  };

  const handleDismissTimePicker = () => {
    setEditingTime(null);
  };

  const handleAddPrayer = () => {
    const newId = (settings.prayerSchedule.length + 1).toString();
    const newPrayer: PrayerScheduleItem = {
      id: newId,
      name: 'New Prayer',
      time: '12:00',
      enabled: true,
    };
    updateSettings({
      prayerSchedule: [...settings.prayerSchedule, newPrayer],
    });
  };

  const handleDeletePrayer = (prayerId: string) => {
    if (settings.prayerSchedule.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one prayer in your schedule.');
      return;
    }

    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedSchedule = settings.prayerSchedule.filter(p => p.id !== prayerId);
            updateSettings({ prayerSchedule: updatedSchedule });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Prayer Schedule</Text>
        <TouchableOpacity onPress={handleAddPrayer} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.accent.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Set your daily prayer times. Tap name to edit, tap time to change. You'll receive notifications when it's time to pray.
        </Text>

        <View style={styles.prayerList}>
          {settings.prayerSchedule.map((prayer) => (
            <View key={prayer.id} style={styles.prayerItem}>
              <View style={styles.prayerInfo}>
                <View style={styles.prayerHeader}>
                  {editingName === prayer.id ? (
                    <TextInput
                      style={styles.nameInput}
                      value={tempName}
                      onChangeText={setTempName}
                      onBlur={() => handleNameChange(prayer.id, tempName)}
                      onSubmitEditing={() => handleNameChange(prayer.id, tempName)}
                      autoFocus
                      placeholder="Prayer name"
                      placeholderTextColor={colors.text.muted}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleNamePress(prayer)}
                      style={styles.nameButton}
                    >
                      <Text style={[styles.prayerName, !prayer.enabled && styles.disabledText]}>
                        {prayer.name}
                      </Text>
                      <Ionicons name="pencil" size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.headerRight}>
                    <Switch
                      value={prayer.enabled}
                      onValueChange={() => handleTogglePrayer(prayer.id)}
                      trackColor={{ false: colors.card, true: colors.accent.teal }}
                      thumbColor="#ffffff"
                      ios_backgroundColor={colors.card}
                    />
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, !prayer.enabled && styles.disabledButton]}
                    onPress={() => prayer.enabled && handleTimePress(prayer)}
                    disabled={!prayer.enabled}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={prayer.enabled ? colors.accent.amber : colors.text.muted}
                    />
                    <Text style={[styles.timeText, !prayer.enabled && styles.disabledText]}>
                      {formatTime(prayer.time)}
                    </Text>
                    {prayer.enabled && (
                      <Ionicons name="chevron-down" size={18} color={colors.text.muted} />
                    )}
                  </TouchableOpacity>

                  {settings.prayerSchedule.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePrayer(prayer.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {editingTime === prayer.id && Platform.OS === 'ios' && (
                <View style={styles.timePickerContainer}>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.timePicker}
                    textColor={colors.text.primary}
                  />
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={handleDismissTimePicker}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.accent.teal} />
          <Text style={styles.infoText}>
            Prayers are scheduled daily. Enable notifications in settings to receive reminders.
          </Text>
        </View>
      </ScrollView>

      {editingTime && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  prayerList: {
    gap: 16,
    marginBottom: 24,
  },
  prayerItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  prayerInfo: {
    gap: 12,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent.teal,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  disabledText: {
    color: colors.text.muted,
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  timePickerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  timePicker: {
    height: 120,
  },
  doneButton: {
    backgroundColor: colors.accent.teal,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 16,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
