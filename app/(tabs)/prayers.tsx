import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

// Local state for non-authenticated users
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
  // Cycle through gradient colors based on sort order
  const gradientKeys = ['teal', 'purple', 'amber', 'blue', 'pink'] as const;
  const gradientKey = gradientKeys[(prayer.sortOrder - 1) % gradientKeys.length];
  const gradientColors = colors.gradients[gradientKey];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.prayerCard}
      >
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
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function FilterPill({
  label,
  isActive,
  onPress,
  color,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterPill,
        isActive && styles.filterPillActive,
        isActive && color && { backgroundColor: color },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          isActive && styles.filterTextActive,
        ]}
      >
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
      // Fetch collections first as they are needed for tabs
      const collectionsData = await getPrayerCollections(user.id);
      setCollections(collectionsData);

      // Then fetch prayers based on current filter
      await fetchFilteredPrayers();
    } catch (error) {
      console.error('Error fetching prayers:', error);
      Alert.alert('Error', 'Failed to load prayers. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, fetchFilteredPrayers]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (!isLoading && user?.id) {
      fetchFilteredPrayers();
    }
  }, [activeFilter, isLoading, user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setActiveFilter('all');
    fetchData();
  };

  const handleAddPrayer = () => {
    router.push('/(modals)/prayer-detail');
  };

  const handlePrayerPress = (prayer: UserPrayer) => {
    router.push({
      pathname: '/(modals)/prayer-detail',
      params: { prayerId: prayer.id },
    });
  };

  const handlePrayerLongPress = (prayer: UserPrayer) => {
    Alert.alert(
      prayer.title,
      'What would you like to do?',
      [
        {
          text: prayer.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          onPress: () => handleToggleFavorite(prayer),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePrayer(prayer),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleToggleFavorite = async (prayer: UserPrayer) => {
    const newFavorite = !prayer.isFavorite;

    // Optimistic update
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayer.id ? { ...p, isFavorite: newFavorite } : p
      )
    );

    if (user?.id) {
      try {
        await updateUserPrayer(prayer.id, { isFavorite: newFavorite });
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // Revert on error
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayer.id ? { ...p, isFavorite: !newFavorite } : p
          )
        );
        Alert.alert('Error', 'Failed to update prayer.');
      }
    }
  };

  const handleDeletePrayer = (prayer: UserPrayer) => {
    Alert.alert(
      'Delete Prayer',
      `Are you sure you want to delete "${prayer.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            const previousPrayers = [...prayers];
            setPrayers((prev) => prev.filter((p) => p.id !== prayer.id));

            if (user?.id) {
              try {
                await deleteUserPrayer(prayer.id);
              } catch (error) {
                console.error('Error deleting prayer:', error);
                setPrayers(previousPrayers);
                Alert.alert('Error', 'Failed to delete prayer.');
              }
            }
          },
        },
      ]
    );
  };

  const getCollectionColor = (colorKey: string) => {
    const colorMap: Record<string, string> = {
      teal: colors.accent.teal,
      purple: colors.accent.purple,
      amber: colors.accent.amber,
      blue: '#3B82F6',
      pink: '#EC4899',
    };
    return colorMap[colorKey] || colors.accent.teal;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prayers</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPrayer}>
          <Ionicons name="add" size={28} color={colors.accent.teal} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <FilterPill
            label="All"
            isActive={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterPill
            label="Favorites"
            isActive={activeFilter === 'favorites'}
            onPress={() => setActiveFilter('favorites')}
            color="#EC4899"
          />
          {collections.map((collection) => (
            <FilterPill
              key={collection.id}
              label={collection.name}
              isActive={activeFilter === collection.id}
              onPress={() => setActiveFilter(collection.id)}
              color={getCollectionColor(collection.color)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Prayer Cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.teal}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.teal} />
            <Text style={styles.loadingText}>Loading prayers...</Text>
          </View>
        ) : prayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No Prayers Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first prayer
            </Text>
          </View>
        ) : (
          <View style={styles.prayersList}>
            {prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onPress={() => handlePrayerPress(prayer)}
                onLongPress={() => handlePrayerLongPress(prayer)}
                onToggleFavorite={() => handleToggleFavorite(prayer)}
              />
            ))}
          </View>
        )}

        {/* Add Collection Button */}
        {!isLoading && user?.id && (
          <TouchableOpacity
            style={styles.addCollectionButton}
            onPress={() => router.push('/(modals)/collection-detail')}
          >
            <Ionicons name="folder-open-outline" size={20} color={colors.accent.teal} />
            <Text style={styles.addCollectionText}>Manage Collections</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
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
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 12,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.accent.teal,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: '#ffffff',
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
    gap: 16,
  },
  prayerCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 100,
  },
  prayerContent: {
    flex: 1,
    marginRight: 12,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  prayerExcerpt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
  },
  addCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  addCollectionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent.teal,
  },
  bottomPadding: {
    height: 100,
  },
});
