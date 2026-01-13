import { supabase } from '@/config/supabase';
import {
  User,
  UserSettings,
  UserStats,
  PrayerSession,
  BlockedApp,
  ScriptureReflection,
  PrayerScheduleItem,
  PrayerCollection,
  UserPrayer,
} from '@/types';

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      is_premium: updates.isPremium,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// USER SETTINGS OPERATIONS
// ============================================================================

export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Map snake_case to camelCase
  return {
    pauseDuration: data.pause_duration,
    dailyGoal: data.daily_goal,
    frequency: data.frequency,
    prayerStyle: data.prayer_style,
    notificationsEnabled: data.notifications_enabled,
    graceDaysEnabled: data.grace_days_enabled,
    maxGraceDays: data.max_grace_days,
    maxConsecutiveGraceDays: data.max_consecutive_grace_days,
  } as UserSettings;
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
) {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      pause_duration: settings.pauseDuration,
      daily_goal: settings.dailyGoal,
      frequency: settings.frequency,
      prayer_style: settings.prayerStyle,
      notifications_enabled: settings.notificationsEnabled,
      grace_days_enabled: settings.graceDaysEnabled,
      max_grace_days: settings.maxGraceDays,
      max_consecutive_grace_days: settings.maxConsecutiveGraceDays,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// USER STATS OPERATIONS
// ============================================================================

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    bestStreak: data.best_streak,
    totalPrayers: data.total_prayers,
    totalMinutes: data.total_minutes,
    weeklyPrayers: data.weekly_prayers,
    graceDaysUsed: data.grace_days_used.map((d: string) => new Date(d)),
    consecutiveGraceDays: data.consecutive_grace_days,
  } as UserStats;
}

export async function updateUserStatsAfterPrayer(
  userId: string,
  duration: number,
  completedAt: Date = new Date()
) {
  const { error } = await supabase.rpc('update_stats_after_prayer', {
    p_user_id: userId,
    p_duration: duration,
    p_completed_at: completedAt.toISOString(),
  });

  if (error) throw error;

  // Fetch and return updated stats
  return getUserStats(userId);
}

// ============================================================================
// PRAYER SESSION OPERATIONS
// ============================================================================

export async function createPrayerSession(
  userId: string,
  session: Omit<PrayerSession, 'id' | 'createdAt'>
) {
  const { data, error } = await supabase
    .from('prayer_sessions')
    .insert({
      user_id: userId,
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt?.toISOString(),
      duration: session.duration,
      triggered_by: session.triggeredBy,
      completed: session.completed,
      mode: session.mode,
      journal_entry: session.journalEntry,
      intent: session.intent,
      tags: session.tags,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePrayerSession(
  sessionId: string,
  updates: Partial<PrayerSession>
) {
  const { data, error } = await supabase
    .from('prayer_sessions')
    .update({
      completed_at: updates.completedAt?.toISOString(),
      duration: updates.duration,
      completed: updates.completed,
      journal_entry: updates.journalEntry,
      intent: updates.intent,
      tags: updates.tags,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPrayerSessions(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from('prayer_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((session) => ({
    id: session.id,
    startedAt: new Date(session.started_at),
    completedAt: session.completed_at ? new Date(session.completed_at) : null,
    duration: session.duration,
    triggeredBy: session.triggered_by,
    completed: session.completed,
    mode: session.mode,
    journalEntry: session.journal_entry,
    intent: session.intent,
    tags: session.tags,
  })) as PrayerSession[];
}

export async function getTodaysPrayerSessions(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('prayer_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', today.toISOString())
    .order('started_at', { ascending: false });

  if (error) throw error;

  return data.map((session) => ({
    id: session.id,
    startedAt: new Date(session.started_at),
    completedAt: session.completed_at ? new Date(session.completed_at) : null,
    duration: session.duration,
    triggeredBy: session.triggered_by,
    completed: session.completed,
    mode: session.mode,
    journalEntry: session.journal_entry,
    intent: session.intent,
    tags: session.tags,
  })) as PrayerSession[];
}

// ============================================================================
// BLOCKED APPS OPERATIONS
// ============================================================================

export async function getBlockedApps(userId: string) {
  const { data, error } = await supabase
    .from('blocked_apps')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((app) => ({
    id: app.app_id,
    name: app.name,
    icon: app.icon,
    gradient: app.gradient as readonly string[],
    isBlocked: app.is_blocked,
  })) as BlockedApp[];
}

export async function updateBlockedApp(
  userId: string,
  appId: string,
  isBlocked: boolean
) {
  const { data, error } = await supabase
    .from('blocked_apps')
    .update({ is_blocked: isBlocked })
    .eq('user_id', userId)
    .eq('app_id', appId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addBlockedApp(userId: string, app: BlockedApp) {
  const { data, error } = await supabase
    .from('blocked_apps')
    .insert({
      user_id: userId,
      app_id: app.id,
      name: app.name,
      icon: app.icon,
      gradient: app.gradient,
      is_blocked: app.isBlocked,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBlockedApp(userId: string, appId: string) {
  const { error } = await supabase
    .from('blocked_apps')
    .delete()
    .eq('user_id', userId)
    .eq('app_id', appId);

  if (error) throw error;
}

// ============================================================================
// SCRIPTURE REFLECTIONS OPERATIONS
// ============================================================================

export async function getScriptureReflections(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from('scripture_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map((reflection) => ({
    id: reflection.id,
    scriptureId: reflection.scripture_id,
    text: reflection.text,
    reference: reflection.reference,
    reflection: reflection.reflection,
    createdAt: new Date(reflection.created_at),
    isFavorite: reflection.is_favorite,
  })) as ScriptureReflection[];
}

export async function createScriptureReflection(
  userId: string,
  reflection: Omit<ScriptureReflection, 'id' | 'createdAt'>
) {
  const { data, error } = await supabase
    .from('scripture_reflections')
    .insert({
      user_id: userId,
      scripture_id: reflection.scriptureId,
      text: reflection.text,
      reference: reflection.reference,
      reflection: reflection.reflection,
      is_favorite: reflection.isFavorite,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScriptureReflection(
  reflectionId: string,
  updates: Partial<ScriptureReflection>
) {
  const { data, error } = await supabase
    .from('scripture_reflections')
    .update({
      reflection: updates.reflection,
      is_favorite: updates.isFavorite,
    })
    .eq('id', reflectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScriptureReflection(reflectionId: string) {
  const { error } = await supabase
    .from('scripture_reflections')
    .delete()
    .eq('id', reflectionId);

  if (error) throw error;
}

export async function getFavoriteReflections(userId: string) {
  const { data, error } = await supabase
    .from('scripture_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((reflection) => ({
    id: reflection.id,
    scriptureId: reflection.scripture_id,
    text: reflection.text,
    reference: reflection.reference,
    reflection: reflection.reflection,
    createdAt: new Date(reflection.created_at),
    isFavorite: reflection.is_favorite,
  })) as ScriptureReflection[];
}

// ============================================================================
// PRAYER SCHEDULE OPERATIONS
// ============================================================================

export async function getPrayerSchedule(userId: string) {
  const { data, error } = await supabase
    .from('prayer_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    time: item.time,
    duration: item.duration,
    enabled: item.enabled,
    selectedPrayerId: item.selected_prayer_id || undefined,
  })) as PrayerScheduleItem[];
}

export async function createPrayerScheduleItem(
  userId: string,
  item: Omit<PrayerScheduleItem, 'id'>
) {
  // Get the next sort_order
  const { data: existingItems } = await supabase
    .from('prayer_schedule')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existingItems && existingItems.length > 0
    ? existingItems[0].sort_order + 1
    : 1;

  const { data, error } = await supabase
    .from('prayer_schedule')
    .insert({
      user_id: userId,
      name: item.name,
      time: item.time,
      duration: item.duration,
      enabled: item.enabled,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    time: data.time,
    duration: data.duration,
    enabled: data.enabled,
    selectedPrayerId: data.selected_prayer_id || undefined,
  } as PrayerScheduleItem;
}

export async function updatePrayerScheduleItem(
  itemId: string,
  updates: Partial<Omit<PrayerScheduleItem, 'id'>>
) {
  // Only include fields that are actually provided
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.time !== undefined) updateData.time = updates.time;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
  if (updates.selectedPrayerId !== undefined) updateData.selected_prayer_id = updates.selectedPrayerId || null;

  const { data, error } = await supabase
    .from('prayer_schedule')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    time: data.time,
    duration: data.duration,
    enabled: data.enabled,
    selectedPrayerId: data.selected_prayer_id || undefined,
  } as PrayerScheduleItem;
}

export async function deletePrayerScheduleItem(itemId: string) {
  const { error } = await supabase
    .from('prayer_schedule')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function updatePrayerSchedule(
  userId: string,
  schedule: PrayerScheduleItem[]
) {
  // Delete all existing schedule items
  await supabase
    .from('prayer_schedule')
    .delete()
    .eq('user_id', userId);

  // Insert new schedule items
  const { data, error } = await supabase
    .from('prayer_schedule')
    .insert(
      schedule.map((item, index) => ({
        id: item.id === 'new' ? undefined : item.id,
        user_id: userId,
        name: item.name,
        time: item.time,
        duration: item.duration,
        enabled: item.enabled,
        selected_prayer_id: item.selectedPrayerId || null,
        sort_order: index + 1,
      }))
    )
    .select();

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    time: item.time,
    duration: item.duration,
    enabled: item.enabled,
    selectedPrayerId: item.selected_prayer_id || undefined,
  })) as PrayerScheduleItem[];
}

// ============================================================================
// PRAYER COLLECTIONS OPERATIONS
// ============================================================================

export async function getPrayerCollections(userId: string) {
  const { data, error } = await supabase
    .from('prayer_collections')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    color: collection.color as PrayerCollection['color'],
    sortOrder: collection.sort_order,
  })) as PrayerCollection[];
}

export async function createPrayerCollection(
  userId: string,
  collection: Omit<PrayerCollection, 'id' | 'sortOrder'>
) {
  // Get the next sort_order
  const { data: existingItems } = await supabase
    .from('prayer_collections')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existingItems && existingItems.length > 0
    ? existingItems[0].sort_order + 1
    : 1;

  const { data, error } = await supabase
    .from('prayer_collections')
    .insert({
      user_id: userId,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color as PrayerCollection['color'],
    sortOrder: data.sort_order,
  } as PrayerCollection;
}

export async function updatePrayerCollection(
  collectionId: string,
  updates: Partial<Omit<PrayerCollection, 'id'>>
) {
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('prayer_collections')
    .update(updateData)
    .eq('id', collectionId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color as PrayerCollection['color'],
    sortOrder: data.sort_order,
  } as PrayerCollection;
}

export async function deletePrayerCollection(collectionId: string) {
  const { error } = await supabase
    .from('prayer_collections')
    .delete()
    .eq('id', collectionId);

  if (error) throw error;
}

// ============================================================================
// USER PRAYERS OPERATIONS
// ============================================================================

export async function getUserPrayers(userId: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((prayer) => ({
    id: prayer.id,
    collectionId: prayer.collection_id || undefined,
    title: prayer.title,
    excerpt: prayer.excerpt,
    fullText: prayer.full_text || undefined,
    isFavorite: prayer.is_favorite,
    sortOrder: prayer.sort_order,
    createdAt: new Date(prayer.created_at),
  })) as UserPrayer[];
}

export async function getUserPrayersByCollection(
  userId: string,
  collectionId: string | null
) {
  let query = supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (collectionId === null) {
    query = query.is('collection_id', null);
  } else {
    query = query.eq('collection_id', collectionId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((prayer) => ({
    id: prayer.id,
    collectionId: prayer.collection_id || undefined,
    title: prayer.title,
    excerpt: prayer.excerpt,
    fullText: prayer.full_text || undefined,
    isFavorite: prayer.is_favorite,
    sortOrder: prayer.sort_order,
    createdAt: new Date(prayer.created_at),
  })) as UserPrayer[];
}

export async function getFavoritePrayers(userId: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((prayer) => ({
    id: prayer.id,
    collectionId: prayer.collection_id || undefined,
    title: prayer.title,
    excerpt: prayer.excerpt,
    fullText: prayer.full_text || undefined,
    isFavorite: prayer.is_favorite,
    sortOrder: prayer.sort_order,
    createdAt: new Date(prayer.created_at),
  })) as UserPrayer[];
}

export async function getUserPrayerById(prayerId: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', prayerId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    collectionId: data.collection_id || undefined,
    title: data.title,
    excerpt: data.excerpt,
    fullText: data.full_text || undefined,
    isFavorite: data.is_favorite,
    sortOrder: data.sort_order,
    createdAt: new Date(data.created_at),
  } as UserPrayer;
}

export async function createUserPrayer(
  userId: string,
  prayer: Omit<UserPrayer, 'id' | 'sortOrder' | 'createdAt'>
) {
  // Get the next sort_order
  const { data: existingItems } = await supabase
    .from('prayers')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existingItems && existingItems.length > 0
    ? existingItems[0].sort_order + 1
    : 1;

  const { data, error } = await supabase
    .from('prayers')
    .insert({
      user_id: userId,
      collection_id: prayer.collectionId || null,
      title: prayer.title,
      excerpt: prayer.excerpt,
      full_text: prayer.fullText || null,
      is_favorite: prayer.isFavorite,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    collectionId: data.collection_id || undefined,
    title: data.title,
    excerpt: data.excerpt,
    fullText: data.full_text || undefined,
    isFavorite: data.is_favorite,
    sortOrder: data.sort_order,
    createdAt: new Date(data.created_at),
  } as UserPrayer;
}

export async function updateUserPrayer(
  prayerId: string,
  updates: Partial<Omit<UserPrayer, 'id' | 'createdAt'>>
) {
  const updateData: Record<string, unknown> = {};
  if (updates.collectionId !== undefined) updateData.collection_id = updates.collectionId || null;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
  if (updates.fullText !== undefined) updateData.full_text = updates.fullText || null;
  if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('prayers')
    .update(updateData)
    .eq('id', prayerId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    collectionId: data.collection_id || undefined,
    title: data.title,
    excerpt: data.excerpt,
    fullText: data.full_text || undefined,
    isFavorite: data.is_favorite,
    sortOrder: data.sort_order,
    createdAt: new Date(data.created_at),
  } as UserPrayer;
}

export async function deleteUserPrayer(prayerId: string) {
  const { error } = await supabase
    .from('prayers')
    .delete()
    .eq('id', prayerId);

  if (error) throw error;
}
