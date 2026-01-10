import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { PrayerScheduleItem } from '@/types';

interface NextPrayerProps {
  prayerSchedule: PrayerScheduleItem[];
}

export function NextPrayer({ prayerSchedule }: NextPrayerProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState('');
  const [nextPrayer, setNextPrayer] = useState<PrayerScheduleItem | null>(null);

  useEffect(() => {
    const updateNextPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // Filter enabled prayers
      const enabledPrayers = prayerSchedule.filter(p => p.enabled);

      if (enabledPrayers.length === 0) {
        setNextPrayer(null);
        return;
      }

      // Convert prayer times to minutes since midnight and find next prayer
      const prayersWithTime = enabledPrayers.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        return { ...prayer, minutesSinceMidnight: prayerTime };
      });

      // Find next prayer
      let next = prayersWithTime.find(p => p.minutesSinceMidnight > currentTime);

      // If no prayer found today, take the first prayer tomorrow
      if (!next) {
        next = prayersWithTime[0];
      }

      setNextPrayer(next);

      // Calculate countdown
      if (next) {
        let minutesUntil = next.minutesSinceMidnight - currentTime;

        // If prayer is tomorrow
        if (minutesUntil < 0) {
          minutesUntil += 24 * 60; // Add 24 hours
        }

        const hours = Math.floor(minutesUntil / 60);
        const minutes = minutesUntil % 60;

        if (hours > 0) {
          setCountdown(`in ${hours}h ${minutes}m`);
        } else {
          setCountdown(`in ${minutes}m`);
        }
      }
    };

    // Update immediately
    updateNextPrayer();

    // Update every minute
    const interval = setInterval(updateNextPrayer, 60000);

    return () => clearInterval(interval);
  }, [prayerSchedule]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handlePress = () => {
    // Navigate to prayer schedule screen
    router.push('/(modals)/prayer-schedule');
  };

  // Check if all prayers for today are complete
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const enabledPrayers = prayerSchedule.filter(p => p.enabled);
  const allComplete = enabledPrayers.every(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    return prayerTime <= currentTime;
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={allComplete && enabledPrayers.length > 0 ? "checkmark-circle" : "time-outline"}
              size={24}
              color={allComplete && enabledPrayers.length > 0 ? colors.accent.teal : colors.accent.amber}
            />
          </View>

          <View style={styles.textContainer}>
            {!nextPrayer ? (
              <>
                <Text style={styles.title}>No prayers scheduled</Text>
                <Text style={styles.subtitle}>Tap to add prayer times</Text>
              </>
            ) : allComplete && enabledPrayers.length > 0 ? (
              <>
                <Text style={styles.title}>All prayers complete! 🎉</Text>
                <Text style={styles.subtitle}>See you tomorrow</Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  Next: {formatTime(nextPrayer.time)} ({nextPrayer.name})
                </Text>
                <Text style={styles.subtitle}>{countdown}</Text>
              </>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
  },
});
