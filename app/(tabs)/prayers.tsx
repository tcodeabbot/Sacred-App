import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPrayer, PrayerCollection } from '@/types';
import {
  getUserPrayers,
  getPrayerCollections,
  getFavoritePrayers,
  getUserPrayersByCollection,
  updateUserPrayer,
  deleteUserPrayer,
} from '@/lib/database';

const LOCAL_PRAYERS: UserPrayer[] = [
  {
    id: '1',
    title: 'Morning Offering',
    excerpt: 'Lord, I offer you this day...',
    fullText: 'Lord, I offer you this day, all my prayers, works, joys, and sufferings.',
    isFavorite: false,
    sortOrder: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Evening Reflection',
    excerpt: 'Thank you Lord for this day...',
    fullText: 'Thank you Lord for this day. For every blessing seen and unseen, I give you thanks.',
    isFavorite: false,
    sortOrder: 2,
    createdAt: new Date(),
  },
];

type FilterType = 'all' | 'favorites' | string;

function PrayerCard({
  prayer,
  onPress,
  onLongPress,
  onToggleFavorite,
}: {
  prayer: UserPrayer;
  onPress: () => void;
  onLongPress: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={styles.prayerCard}
    >
      {/* Teal accent bar */}
      <View style={styles.prayerAccentBar} />
      <View style={styles.prayerContent}>
        <Text style={styles.prayerTitle}>{prayer.title}</Text>
        <Text style={styles.prayerExcerpt} numberOfLines={2}>
          {prayer.excerpt}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={prayer.isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={prayer.isFavorite ? colors.accent.destructive : colors.text.tertiary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function PrayersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [prayers, setPrayers] = useState<UserPrayer[]>([]);
  const [collections, setCollections] = useState<PrayerCollection[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFilteredPrayers = useCallback(async () => {
    if (!user?.id) return;
    try {
      let prayersData: UserPrayer[];
      if (activeFilter === 'all') {
        prayersData = await getUserPrayers(user.id);
      } else if (activeFilter === 'favorites') {
        prayersData = await getFavoritePrayers(user.id);
      } else {
        prayersData = await getUserPrayersByCollection(user.id, activeFilter);
      }
      setPrayers(prayersData);
    } catch (error) {
      console.error('Error fetching filtered prayers:', error);
    }
  }, [user?.id, activeFilter]);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setPrayers(LOCAL_PRAYERS);
      setCollections([]);
      setIsLoading(false);
      return;
    }
    try {
      const collectionsData = await getPrayerCollections(user.id);
      setCollections(collectionsData);
      await fetchFilteredPrayers();
    } catch (error) {
      console.error('Error fetching prayers:', error);
      Alert.alert('Error', 'Failed to load prayers. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, fetchFilteredPrayers]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  useEffect(() => {
    if (!isLoading && user?.id) fetchFilteredPrayers();
  }, [activeFilter, isLoading, user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setActiveFilter('all');
    fetchData();
  };

  const handleToggleFavorite = async (prayer: UserPrayer) => {
    const newFavorite = !prayer.isFavorite;
    setPrayers(prev => prev.map(p => p.id === prayer.id ? { ...p, isFavorite: newFavorite } : p));
    if (user?.id) {
      try {
        await updateUserPrayer(prayer.id, { isFavorite: newFavorite });
      } catch {
        setPrayers(prev => prev.map(p => p.id === prayer.id ? { ...p, isFavorite: !newFavorite } : p));
        Alert.alert('Error', 'Failed to update prayer.');
      }
    }
  };

  const handleDeletePrayer = (prayer: UserPrayer) => {
    Alert.alert('Delete Prayer', `Are you sure you want to delete "${prayer.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const prev = [...prayers];
          setPrayers(p => p.filter(x => x.id !== prayer.id));
          if (user?.id) {
            try {
              await deleteUserPrayer(prayer.id);
            } catch {
              setPrayers(prev);
              Alert.alert('Error', 'Failed to delete prayer.');
            }
          }
        },
      },
    ]);
  };

  const handlePrayerLongPress = (prayer: UserPrayer) => {
    Alert.alert(prayer.title, 'What would you like to do?', [
      { text: prayer.isFavorite ? 'Remove from Favorites' : 'Add to Favorites', onPress: () => handleToggleFavorite(prayer) },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeletePrayer(prayer) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prayers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(modals)/prayer-detail')}
        >
          <Ionicons name="add" size={24} color={colors.accent.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <FilterChip label="All" isActive={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
          <FilterChip label="Favorites" isActive={activeFilter === 'favorites'} onPress={() => setActiveFilter('favorites')} />
          {collections.map(col => (
            <FilterChip
              key={col.id}
              label={col.name}
              isActive={activeFilter === col.id}
              onPress={() => setActiveFilter(col.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.accent.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>Loading prayers...</Text>
          </View>
        ) : prayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Prayers Yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first prayer</Text>
          </View>
        ) : (
          <View style={styles.prayersList}>
            {prayers.map(prayer => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onPress={() => router.push({ pathname: '/(modals)/prayer-detail', params: { prayerId: prayer.id } })}
                onLongPress={() => handlePrayerLongPress(prayer)}
                onToggleFavorite={() => handleToggleFavorite(prayer)}
              />
            ))}
          </View>
        )}

        {!isLoading && user?.id && (
          <TouchableOpacity
            style={styles.manageCollectionsButton}
            onPress={() => router.push('/(modals)/collection-detail')}
          >
            <Ionicons name="folder-open-outline" size={18} color={colors.accent.primary} />
            <Text style={styles.manageCollectionsText}>Manage Collections</Text>
          </TouchableOpacity>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  prayersList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 80,
  },
  prayerAccentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: colors.accent.primary,
  },
  prayerContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  prayerExcerpt: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  manageCollectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageCollectionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.primary,
  },
});
