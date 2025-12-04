import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { prayers, prayerCategories } from '@/constants/prayers';
import { Prayer } from '@/types';

function PrayerCard({ prayer }: { prayer: Prayer }) {
  const gradientColors = colors.gradients[prayer.gradient];
  
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.prayerCard}
      >
        <View style={styles.prayerContent}>
          <Text style={styles.prayerTitle}>{prayer.title}</Text>
          <Text style={styles.prayerDescription}>{prayer.description}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{prayer.duration} min</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function PrayersScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredPrayers = selectedCategory === 'All'
    ? prayers
    : prayers.filter((p) => p.category === selectedCategory);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Prayers</Text>
        
        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {prayerCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Prayer Cards */}
        <View style={styles.prayersList}>
          {filteredPrayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))}
        </View>
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  categoryPillActive: {
    backgroundColor: colors.accent.teal,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  prayersList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 100,
  },
  prayerCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  prayerContent: {
    flex: 1,
    marginRight: 12,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  prayerDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
