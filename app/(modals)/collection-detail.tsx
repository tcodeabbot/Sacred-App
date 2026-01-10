import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { PrayerCollection } from '@/types';
import {
    getPrayerCollections,
    createPrayerCollection,
    updatePrayerCollection,
    deletePrayerCollection,
} from '@/lib/database';

const COLORS: PrayerCollection['color'][] = ['teal', 'purple', 'amber', 'blue', 'pink'];

function getColorValue(colorKey: string): string {
    const colorMap: Record<string, string> = {
        teal: colors.accent.teal,
        purple: colors.accent.purple,
        amber: colors.accent.amber,
        blue: '#3B82F6',
        pink: '#EC4899',
    };
    return colorMap[colorKey] || colors.accent.teal;
}

export default function CollectionDetailScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [collections, setCollections] = useState<PrayerCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for new/editing collection
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState<PrayerCollection['color']>('teal');

    const fetchCollections = useCallback(async () => {
        if (!user?.id) return;

        try {
            const data = await getPrayerCollections(user.id);
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
            Alert.alert('Error', 'Failed to load collections.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const resetForm = () => {
        setShowNewForm(false);
        setEditingId(null);
        setName('');
        setDescription('');
        setSelectedColor('teal');
    };

    const handleStartEdit = (collection: PrayerCollection) => {
        setEditingId(collection.id);
        setName(collection.name);
        setDescription(collection.description || '');
        setSelectedColor(collection.color);
        setShowNewForm(false);
    };

    const handleStartNew = () => {
        resetForm();
        setShowNewForm(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter a collection name.');
            return;
        }

        if (!user?.id) return;

        setIsSaving(true);

        try {
            if (editingId) {
                await updatePrayerCollection(editingId, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    color: selectedColor,
                });
            } else {
                await createPrayerCollection(user.id, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    color: selectedColor,
                });
            }

            resetForm();
            fetchCollections();
        } catch (error) {
            console.error('Error saving collection:', error);
            Alert.alert('Error', 'Failed to save collection.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (collection: PrayerCollection) => {
        Alert.alert(
            'Delete Collection',
            `Delete "${collection.name}"? Prayers in this collection will be moved to "Uncategorized".`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePrayerCollection(collection.id);
                            fetchCollections();
                        } catch (error) {
                            console.error('Error deleting collection:', error);
                            Alert.alert('Error', 'Failed to delete collection.');
                        }
                    },
                },
            ]
        );
    };

    const renderCollectionItem = (collection: PrayerCollection) => {
        const isEditing = editingId === collection.id;

        if (isEditing) {
            return renderForm(true);
        }

        return (
            <View key={collection.id} style={styles.collectionItem}>
                <View
                    style={[styles.colorIndicator, { backgroundColor: getColorValue(collection.color) }]}
                />
                <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    {collection.description && (
                        <Text style={styles.collectionDescription}>{collection.description}</Text>
                    )}
                </View>
                <View style={styles.collectionActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleStartEdit(collection)}
                    >
                        <Ionicons name="pencil" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(collection)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderForm = (isInline: boolean = false) => (
        <View
            key={isInline ? 'edit-form' : 'new-form'}
            style={[styles.formContainer, isInline && styles.formContainerInline]}
        >
            <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Collection name"
                placeholderTextColor={colors.text.muted}
                autoFocus={!isInline}
            />
            <TextInput
                style={[styles.formInput, styles.formInputSmall]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor={colors.text.muted}
            />

            <View style={styles.colorPicker}>
                {COLORS.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorOption,
                            { backgroundColor: getColorValue(color) },
                            selectedColor === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setSelectedColor(color)}
                    >
                        {selectedColor === color && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveFormButton, isSaving && styles.saveFormButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveFormButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Collections</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleStartNew}
                    disabled={showNewForm}
                >
                    <Ionicons
                        name="add"
                        size={24}
                        color={showNewForm ? colors.text.muted : colors.accent.teal}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent.teal} />
                    </View>
                ) : (
                    <>
                        {/* New Collection Form */}
                        {showNewForm && renderForm(false)}

                        {/* Collections List */}
                        {collections.length === 0 && !showNewForm ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="folder-open-outline" size={48} color={colors.text.muted} />
                                <Text style={styles.emptyText}>No collections yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Tap + to create your first collection
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.collectionsList}>
                                {collections.map(renderCollectionItem)}
                            </View>
                        )}
                    </>
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
    addButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 4,
    },
    collectionsList: {
        gap: 12,
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    colorIndicator: {
        width: 12,
        height: 40,
        borderRadius: 6,
        marginRight: 14,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    collectionDescription: {
        fontSize: 13,
        color: colors.text.secondary,
        marginTop: 2,
    },
    collectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    formContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.accent.teal,
        marginBottom: 16,
    },
    formContainerInline: {
        marginBottom: 0,
    },
    formInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: colors.text.primary,
        marginBottom: 12,
    },
    formInputSmall: {
        fontSize: 14,
    },
    colorPicker: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text.secondary,
    },
    saveFormButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: colors.accent.teal,
    },
    saveFormButtonDisabled: {
        opacity: 0.6,
    },
    saveFormButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    bottomPadding: {
        height: 40,
    },
});
