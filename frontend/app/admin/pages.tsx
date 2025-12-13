import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePageContent, useUpdatePageContent } from '../../src/api/admin';

const PAGES = [
    { slug: 'about', label: 'About Us' },
    { slug: 'privacy', label: 'Privacy Policy' },
    { slug: 'terms', label: 'Terms of Service' },
    { slug: 'faq', label: 'FAQ' },
];

export default function PagesScreen() {
    const [activeTab, setActiveTab] = useState('about');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const { data: pageContent, isLoading, refetch } = usePageContent(activeTab);
    const updatePage = useUpdatePageContent();

    useEffect(() => {
        if (pageContent) {
            setTitle(pageContent.title || '');
            setBody(pageContent.body || '');
            setHasChanges(false);
        }
    }, [pageContent]);

    const handleTabChange = (slug: string) => {
        if (hasChanges) {
            const confirmSwitch = Platform.OS === 'web'
                ? window.confirm('You have unsaved changes. Switch anyway?')
                : true; // On mobile, just switch
            if (!confirmSwitch) return;
        }
        setActiveTab(slug);
    };

    const handleTitleChange = (text: string) => {
        setTitle(text);
        setHasChanges(true);
    };

    const handleBodyChange = (text: string) => {
        setBody(text);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            await updatePage.mutateAsync({
                slug: activeTab,
                data: { title, body },
            });
            setHasChanges(false);
            if (Platform.OS === 'web') {
                alert('Page saved successfully!');
            } else {
                Alert.alert('Success', 'Page saved successfully!');
            }
        } catch (error) {
            if (Platform.OS === 'web') {
                alert('Failed to save page');
            } else {
                Alert.alert('Error', 'Failed to save page');
            }
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Page Management</Text>
                    <Text style={styles.subtitle}>Edit static content pages (About, Privacy, Terms)</Text>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {PAGES.map((page) => (
                            <Pressable
                                key={page.slug}
                                style={[
                                    styles.tab,
                                    activeTab === page.slug && styles.tabActive,
                                ]}
                                onPress={() => handleTabChange(page.slug)}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === page.slug && styles.tabTextActive,
                                    ]}
                                >
                                    {page.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Editor */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5A31F4" />
                    </View>
                ) : (
                    <View style={styles.editorContainer}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Page Title</Text>
                            <TextInput
                                style={styles.titleInput}
                                value={title}
                                onChangeText={handleTitleChange}
                                placeholder="Enter page title..."
                                placeholderTextColor="#888"
                            />
                        </View>

                        {/* Body Editor */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Content</Text>
                            <TextInput
                                style={styles.bodyInput}
                                value={body}
                                onChangeText={handleBodyChange}
                                placeholder="Enter page content..."
                                placeholderTextColor="#888"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Save Button */}
                        <View style={styles.actionRow}>
                            {hasChanges && (
                                <View style={styles.unsavedBadge}>
                                    <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                                    <Text style={styles.unsavedText}>Unsaved changes</Text>
                                </View>
                            )}
                            <Pressable
                                style={[
                                    styles.saveButton,
                                    updatePage.isPending && styles.saveButtonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={updatePage.isPending}
                            >
                                {updatePage.isPending ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#FFF" />
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>

                        {/* Last Updated */}
                        {pageContent?.updatedAt && (
                            <Text style={styles.lastUpdated}>
                                Last updated: {new Date(pageContent.updatedAt).toLocaleString()}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        padding: 24,
        maxWidth: 1000,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    tabContainer: {
        marginBottom: 24,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tabActive: {
        backgroundColor: '#5A31F4',
        borderColor: '#5A31F4',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#FFF',
    },
    loadingContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editorContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    titleInput: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    bodyInput: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#333',
        minHeight: 300,
        lineHeight: 24,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    unsavedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    unsavedText: {
        color: '#F59E0B',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#5A31F4',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
        marginLeft: 8,
    },
    lastUpdated: {
        marginTop: 20,
        fontSize: 13,
        color: '#888',
        textAlign: 'right',
    },
});
