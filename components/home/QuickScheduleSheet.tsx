import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

interface QuickScheduleSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (time: string, name: string, repeatType: 'once' | 'daily') => void;
}

const PRAYER_TYPES = [
  'Morning Prayer',
  'Noon Prayer',
  'Evening Prayer',
  'Night Prayer',
  'Custom Prayer',
];

const REPEAT_OPTIONS = [
  { label: 'Once', value: 'once' as const },
  { label: 'Daily', value: 'daily' as const },
];

export function QuickScheduleSheet({ isVisible, onClose, onSave }: QuickScheduleSheetProps) {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedPrayerType, setSelectedPrayerType] = useState('Custom Prayer');
  const [selectedRepeat, setSelectedRepeat] = useState<'once' | 'daily'>('daily');
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleSave = () => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    onSave(timeString, selectedPrayerType, selectedRepeat);
    onClose();
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} snapPoint={0.7}>
      <View style={styles.container}>
        <Text style={styles.title}>Schedule Prayer</Text>
        <Text style={styles.subtitle}>Quickly add a new prayer time</Text>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => Platform.OS === 'android' && setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>{formatTime(selectedTime)}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.timePicker}
              textColor={colors.text.primary}
            />
          )}
        </View>

        {/* Prayer Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Prayer Name</Text>
          <View style={styles.chipContainer}>
            {PRAYER_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  selectedPrayerType === type && styles.chipSelected,
                ]}
                onPress={() => setSelectedPrayerType(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedPrayerType === type && styles.chipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Repeat Options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repeat</Text>
          <View style={styles.repeatContainer}>
            {REPEAT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.repeatOption,
                  selectedRepeat === option.value && styles.repeatOptionSelected,
                ]}
                onPress={() => setSelectedRepeat(option.value)}
              >
                <Text
                  style={[
                    styles.repeatOptionText,
                    selectedRepeat === option.value && styles.repeatOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.saveButtonContainer}>
            <Button
              title="Save Prayer"
              onPress={handleSave}
              gradient={colors.gradients.teal}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeButton: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.accent.teal,
  },
  timePicker: {
    marginTop: 12,
    height: 120,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.teal,
  },
  chipText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  repeatContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  repeatOptionSelected: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.teal,
  },
  repeatOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  repeatOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.muted,
    fontWeight: '600',
  },
  saveButtonContainer: {
    flex: 2,
  },
});
