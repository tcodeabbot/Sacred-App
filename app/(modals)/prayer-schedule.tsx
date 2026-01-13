import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { PrayerScheduleItem, UserPrayer } from '@/types';
import {
  getPrayerSchedule,
  createPrayerScheduleItem,
  updatePrayerScheduleItem,
  deletePrayerScheduleItem,
  getUserPrayers,
  getUserPrayerById,
} from '@/lib/database';

export default function PrayerScheduleScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();
  const { user } = useAuthStore();
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [tempName, setTempName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [schedule, setSchedule] = useState<PrayerScheduleItem[]>(settings.prayerSchedule);
  const [userPrayers, setUserPrayers] = useState<UserPrayer[]>([]);
  const [selectingPrayerFor, setSelectingPrayerFor] = useState<string | null>(null);

  // Fetch prayer schedule from database on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        // Use local settings if not authenticated
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [scheduleData, prayersData] = await Promise.all([
          getPrayerSchedule(user.id),
          getUserPrayers(user.id),
        ]);
        setSchedule(scheduleData);
        setUserPrayers(prayersData);
        // Also update local store to keep in sync
        updateSettings({ prayerSchedule: scheduleData });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep using initial local settings on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-fetch when user changes

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const durationOptions = [2, 5, 10, 15, 20, 30, 45, 60];

  const handleDurationChange = async (prayerId: string, newDuration: number) => {
    console.log('Updating prayer duration:', { prayerId, newDuration });

    // Optimistically update UI
    const updatedSchedule = schedule.map(prayer =>
      prayer.id === prayerId ? { ...prayer, duration: newDuration } : prayer
    );
    setSchedule(updatedSchedule);
    updateSettings({ prayerSchedule: updatedSchedule });

    // Sync with database
    if (user?.id) {
      try {
        const result = await updatePrayerScheduleItem(prayerId, { duration: newDuration });
        console.log('Prayer duration updated in database:', result);
      } catch (error) {
        console.error('Error updating prayer duration:', error);
        // Revert on error
        setSchedule(schedule);
        Alert.alert('Error', 'Failed to update prayer duration. Please try again.');
      }
    }
  };

  const showDurationPicker = (prayer: PrayerScheduleItem) => {
    Alert.alert(
      'Prayer Duration',
      `Select duration for ${prayer.name}`,
      [
        ...durationOptions.map(duration => ({
          text: formatDuration(duration),
          onPress: () => handleDurationChange(prayer.id, duration),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const handleSelectPrayer = async (scheduleItemId: string, selectedPrayerId: string | undefined) => {
    // Optimistically update UI
    const updatedSchedule = schedule.map(item =>
      item.id === scheduleItemId ? { ...item, selectedPrayerId } : item
    );
    setSchedule(updatedSchedule);
    updateSettings({ prayerSchedule: updatedSchedule });
    setSelectingPrayerFor(null);

    // Sync with database
    if (user?.id) {
      try {
        await updatePrayerScheduleItem(scheduleItemId, { selectedPrayerId });
      } catch (error) {
        console.error('Error updating selected prayer:', error);
        setSchedule(schedule);
        Alert.alert('Error', 'Failed to update prayer selection.');
      }
    }
  };

  const getSelectedPrayerName = (selectedPrayerId?: string) => {
    if (!selectedPrayerId) return 'None selected';
    const prayer = userPrayers.find(p => p.id === selectedPrayerId);
    return prayer?.title || 'Deleted prayer';
  };


  const handleTogglePrayer = async (prayerId: string) => {
    const prayer = schedule.find(p => p.id === prayerId);
    if (!prayer) return;

    const newEnabled = !prayer.enabled;
    console.log('Toggling prayer:', { prayerId, newEnabled });

    // Optimistically update UI
    const updatedSchedule = schedule.map(p =>
      p.id === prayerId ? { ...p, enabled: newEnabled } : p
    );
    setSchedule(updatedSchedule);
    updateSettings({ prayerSchedule: updatedSchedule });

    // Sync with database
    if (user?.id) {
      try {
        const result = await updatePrayerScheduleItem(prayerId, { enabled: newEnabled });
        console.log('Prayer toggled in database:', result);
      } catch (error) {
        console.error('Error updating prayer schedule:', error);
        // Revert on error
        setSchedule(schedule);
        Alert.alert('Error', 'Failed to update prayer. Please try again.');
      }
    }
  };

  const handleNamePress = (prayer: PrayerScheduleItem) => {
    setTempName(prayer.name);
    setEditingName(prayer.id);
  };

  const handleNameChange = async (prayerId: string, newName: string) => {
    if (!newName.trim()) {
      setEditingName(null);
      setTempName('');
      return;
    }

    const trimmedName = newName.trim();
    console.log('Updating prayer name:', { prayerId, trimmedName });

    // Optimistically update UI
    const updatedSchedule = schedule.map(prayer =>
      prayer.id === prayerId ? { ...prayer, name: trimmedName } : prayer
    );
    setSchedule(updatedSchedule);
    updateSettings({ prayerSchedule: updatedSchedule });
    setEditingName(null);
    setTempName('');

    // Sync with database
    if (user?.id) {
      try {
        const result = await updatePrayerScheduleItem(prayerId, { name: trimmedName });
        console.log('Prayer name updated in database:', result);
      } catch (error) {
        console.error('Error updating prayer name:', error);
        // Revert on error
        setSchedule(schedule);
        Alert.alert('Error', 'Failed to update prayer name. Please try again.');
      }
    } else {
      console.log('No user logged in, only updating local state');
    }
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

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    // On Android, dismiss picker after selection
    if (Platform.OS === 'android') {
      setEditingTime(null);
    }

    // Handle time change
    if (selectedDate && editingTime) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      console.log('Updating prayer time:', { prayerId: editingTime, newTime });

      // Optimistically update UI
      const updatedSchedule = schedule.map(prayer =>
        prayer.id === editingTime ? { ...prayer, time: newTime } : prayer
      );
      setSchedule(updatedSchedule);
      updateSettings({ prayerSchedule: updatedSchedule });

      // On iOS, keep picker open and update temp time
      if (Platform.OS === 'ios') {
        setTempTime(selectedDate);
      }

      // Sync with database
      if (user?.id) {
        try {
          const result = await updatePrayerScheduleItem(editingTime, { time: newTime });
          console.log('Prayer time updated in database:', result);
        } catch (error) {
          console.error('Error updating prayer time:', error);
          // Revert on error
          setSchedule(schedule);
          Alert.alert('Error', 'Failed to update prayer time. Please try again.');
        }
      }
    }
  };

  const handleDismissTimePicker = () => {
    setEditingTime(null);
  };

  const handleAddPrayer = async () => {
    const newPrayer: Omit<PrayerScheduleItem, 'id'> = {
      name: 'New Prayer',
      time: '12:00',
      duration: 5, // Default 5 minutes
      enabled: true,
    };

    if (user?.id) {
      try {
        setIsSaving(true);
        const createdPrayer = await createPrayerScheduleItem(user.id, newPrayer);
        const updatedSchedule = [...schedule, createdPrayer];
        setSchedule(updatedSchedule);
        updateSettings({ prayerSchedule: updatedSchedule });
      } catch (error) {
        console.error('Error creating prayer schedule:', error);
        Alert.alert('Error', 'Failed to add prayer. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Local-only mode
      const localPrayer: PrayerScheduleItem = {
        ...newPrayer,
        id: Date.now().toString(),
      };
      const updatedSchedule = [...schedule, localPrayer];
      setSchedule(updatedSchedule);
      updateSettings({ prayerSchedule: updatedSchedule });
    }
  };

  const handleDeletePrayer = (prayerId: string) => {

    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistically update UI
            const updatedSchedule = schedule.filter(p => p.id !== prayerId);
            setSchedule(updatedSchedule);
            updateSettings({ prayerSchedule: updatedSchedule });

            // Sync with database
            if (user?.id) {
              try {
                await deletePrayerScheduleItem(prayerId);
              } catch (error) {
                console.error('Error deleting prayer:', error);
                // Revert on error
                setSchedule(schedule);
                Alert.alert('Error', 'Failed to delete prayer. Please try again.');
              }
            }
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
        <TouchableOpacity onPress={handleAddPrayer} style={styles.addButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.accent.teal} />
          ) : (
            <Ionicons name="add" size={24} color={colors.accent.teal} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Set your daily prayer times. Tap name to edit, tap time to change. You'll receive notifications when it's time to pray.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.teal} />
            <Text style={styles.loadingText}>Loading prayer schedule...</Text>
          </View>
        ) : (
          <View style={styles.prayerList}>
            {schedule.length > 0 ? (
              schedule.map((prayer) => (
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

                      <TouchableOpacity
                        style={[styles.durationButton, !prayer.enabled && styles.disabledButton]}
                        onPress={() => prayer.enabled && showDurationPicker(prayer)}
                        disabled={!prayer.enabled}
                      >
                        <Ionicons
                          name="hourglass-outline"
                          size={18}
                          color={prayer.enabled ? colors.accent.purple : colors.text.muted}
                        />
                        <Text style={[styles.durationText, !prayer.enabled && styles.disabledText]}>
                          {formatDuration(prayer.duration || 5)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePrayer(prayer.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Prayer Selector Row */}
                    {prayer.enabled && user?.id && (
                      <TouchableOpacity
                        style={styles.prayerSelectorRow}
                        onPress={() => setSelectingPrayerFor(
                          selectingPrayerFor === prayer.id ? null : prayer.id
                        )}
                      >
                        <Ionicons
                          name="book-outline"
                          size={18}
                          color={colors.accent.teal}
                        />
                        <Text style={styles.prayerSelectorText}>
                          {getSelectedPrayerName(prayer.selectedPrayerId)}
                        </Text>
                        <Ionicons
                          name={selectingPrayerFor === prayer.id ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.text.muted}
                        />
                      </TouchableOpacity>
                    )}

                    {/* Prayer Selection Dropdown */}
                    {selectingPrayerFor === prayer.id && (
                      <View style={styles.prayerPickerContainer}>
                        <TouchableOpacity
                          style={[
                            styles.prayerPickerOption,
                            !prayer.selectedPrayerId && styles.prayerPickerOptionActive,
                          ]}
                          onPress={() => handleSelectPrayer(prayer.id, undefined)}
                        >
                          <Text style={[
                            styles.prayerPickerOptionText,
                            !prayer.selectedPrayerId && styles.prayerPickerOptionTextActive,
                          ]}>
                            None
                          </Text>
                        </TouchableOpacity>
                        {userPrayers.map((userPrayer) => (
                          <TouchableOpacity
                            key={userPrayer.id}
                            style={[
                              styles.prayerPickerOption,
                              prayer.selectedPrayerId === userPrayer.id && styles.prayerPickerOptionActive,
                            ]}
                            onPress={() => handleSelectPrayer(prayer.id, userPrayer.id)}
                          >
                            <Text style={[
                              styles.prayerPickerOptionText,
                              prayer.selectedPrayerId === userPrayer.id && styles.prayerPickerOptionTextActive,
                            ]}>
                              {userPrayer.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {userPrayers.length === 0 && (
                          <Text style={styles.noPrayersText}>
                            No prayers yet. Create some in the Prayers tab.
                          </Text>
                        )}
                      </View>
                    )}
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
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="calendar-outline" size={48} color={colors.text.muted} />
                </View>
                <Text style={styles.emptyTitle}>No prayers scheduled</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first prayer to start building your daily spiritual routine.
                </Text>
                <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddPrayer}>
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.emptyAddButtonText}>Add Prayer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
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
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.purple,
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
  prayerSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 12,
  },
  prayerSelectorText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  prayerPickerContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  prayerPickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  prayerPickerOptionActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
  },
  prayerPickerOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  prayerPickerOptionTextActive: {
    color: colors.accent.teal,
    fontWeight: '500',
  },
  noPrayersText: {
    fontSize: 13,
    color: colors.text.muted,
    fontStyle: 'italic',
    padding: 14,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent.teal,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
