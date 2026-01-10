import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPrayer, PrayerCollection } from '@/types';
import {
    getUserPrayerById,
    createUserPrayer,
    updateUserPrayer,
    deleteUserPrayer,
    getPrayerCollections,
} from '@/lib/database';

export default function PrayerDetailScreen() {
    const router = useRouter();
    const { prayerId } = useLocalSearchParams<{ prayerId?: string }>();
    const { user } = useAuthStore();

    const isNew = !prayerId;

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [fullText, setFullText] = useState('');
    const [collectionId, setCollectionId] = useState<string | undefined>(undefined);
    const [isFavorite, setIsFavorite] = useState(false);

    const [collections, setCollections] = useState<PrayerCollection[]>([]);
    const [showCollectionPicker, setShowCollectionPicker] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                // Fetch collections
                const collectionsData = await getPrayerCollections(user.id);
                setCollections(collectionsData);

                // Fetch prayer if editing
                if (prayerId) {
                    const prayer = await getUserPrayerById(prayerId);
                    setTitle(prayer.title);
                    setExcerpt(prayer.excerpt);
                    setFullText(prayer.fullText || '');
                    setCollectionId(prayer.collectionId);
                    setIsFavorite(prayer.isFavorite);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'Failed to load prayer details.');
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id, prayerId, router]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a title for your prayer.');
            return;
        }

        if (!excerpt.trim()) {
            Alert.alert('Required', 'Please enter an excerpt for your prayer.');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'You must be logged in to save prayers.');
            return;
        }

        setIsSaving(true);

        try {
            if (isNew) {
                await createUserPrayer(user.id, {
                    title: title.trim(),
                    excerpt: excerpt.trim(),
                    fullText: fullText.trim() || undefined,
                    collectionId,
                    isFavorite,
                });
            } else {
                await updateUserPrayer(prayerId!, {
                    title: title.trim(),
                    excerpt: excerpt.trim(),
                    fullText: fullText.trim() || undefined,
                    collectionId,
                    isFavorite,
                });
            }

            router.back();
        } catch (error) {
            console.error('Error saving prayer:', error);
            Alert.alert('Error', 'Failed to save prayer. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (!prayerId) return;

        Alert.alert(
            'Delete Prayer',
            'Are you sure you want to delete this prayer? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUserPrayer(prayerId);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting prayer:', error);
                            Alert.alert('Error', 'Failed to delete prayer.');
                        }
                    },
                },
            ]
        );
    };

    const getSelectedCollection = () => {
        if (!collectionId) return null;
        return collections.find((c) => c.id === collectionId);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.teal} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isNew ? 'New Prayer' : 'Edit Prayer'}</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={colors.accent.teal} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g., Morning Offering"
                            placeholderTextColor={colors.text.muted}
                            maxLength={100}
                        />
                    </View>

                    {/* Excerpt Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Excerpt</Text>
                        <Text style={styles.labelHint}>
                            Short text shown on prayer cards (1-2 sentences)
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={excerpt}
                            onChangeText={setExcerpt}
                            placeholder="Lord, I offer you this day..."
                            placeholderTextColor={colors.text.muted}
                            multiline
                            numberOfLines={3}
                            maxLength={200}
                        />
                        <Text style={styles.charCount}>{excerpt.length}/200</Text>
                    </View>

                    {/* Full Text Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Prayer (Optional)</Text>
                        <Text style={styles.labelHint}>
                            Complete text shown during prayer sessions
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textAreaLarge]}
                            value={fullText}
                            onChangeText={setFullText}
                            placeholder="Write the complete prayer here..."
                            placeholderTextColor={colors.text.muted}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Collection Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Collection</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowCollectionPicker(!showCollectionPicker)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {getSelectedCollection()?.name || 'None'}
                            </Text>
                            <Ionicons
                                name={showCollectionPicker ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={colors.text.secondary}
                            />
                        </TouchableOpacity>

                        {showCollectionPicker && (
                            <View style={styles.pickerOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.pickerOption,
                                        !collectionId && styles.pickerOptionActive,
                                    ]}
                                    onPress={() => {
                                        setCollectionId(undefined);
                                        setShowCollectionPicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.pickerOptionText,
                                            !collectionId && styles.pickerOptionTextActive,
                                        ]}
                                    >
                                        None
                                    </Text>
                                </TouchableOpacity>
                                {collections.map((collection) => (
                                    <TouchableOpacity
                                        key={collection.id}
                                        style={[
                                            styles.pickerOption,
                                            collectionId === collection.id && styles.pickerOptionActive,
                                        ]}
                                        onPress={() => {
                                            setCollectionId(collection.id);
                                            setShowCollectionPicker(false);
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.collectionDot,
                                                { backgroundColor: getCollectionColor(collection.color) },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.pickerOptionText,
                                                collectionId === collection.id && styles.pickerOptionTextActive,
                                            ]}
                                        >
                                            {collection.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Favorite Toggle */}
                    <TouchableOpacity
                        style={styles.favoriteRow}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <View style={styles.favoriteInfo}>
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? '#EC4899' : colors.text.secondary}
                            />
                            <Text style={styles.favoriteLabel}>Favorite</Text>
                        </View>
                        <View
                            style={[
                                styles.checkbox,
                                isFavorite && styles.checkboxActive,
                            ]}
                        >
                            {isFavorite && (
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    {!isNew && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            <Text style={styles.deleteButtonText}>Delete Prayer</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function getCollectionColor(colorKey: string): string {
    const colorMap: Record<string, string> = {
        teal: colors.accent.teal,
        purple: colors.accent.purple,
        amber: colors.accent.amber,
        blue: '#3B82F6',
        pink: '#EC4899',
    };
    return colorMap[colorKey] || colors.accent.teal;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.accent.teal,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    labelHint: {
        fontSize: 13,
        color: colors.text.muted,
        marginBottom: 10,
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    textAreaLarge: {
        minHeight: 150,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: colors.text.muted,
        textAlign: 'right',
        marginTop: 4,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    pickerButtonText: {
        fontSize: 16,
        color: colors.text.primary,
    },
    pickerOptions: {
        marginTop: 8,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: 'hidden',
    },
    pickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    pickerOptionActive: {
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
    },
    pickerOptionText: {
        fontSize: 15,
        color: colors.text.primary,
    },
    pickerOptionTextActive: {
        color: colors.accent.teal,
        fontWeight: '500',
    },
    collectionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    favoriteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 24,
    },
    favoriteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    favoriteLabel: {
        fontSize: 16,
        color: colors.text.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.text.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.accent.teal,
        borderColor: colors.accent.teal,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#EF4444',
    },
    bottomPadding: {
        height: 40,
    },
});
