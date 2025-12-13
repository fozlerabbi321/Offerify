import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminSettings, useUpdateSettings } from '../../src/api/admin';

interface SettingField {
    key: string;
    label: string;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const SETTING_FIELDS: SettingField[] = [
    { key: 'support_email', label: 'Support Email', placeholder: 'support@example.com', icon: 'mail-outline' },
    { key: 'app_version', label: 'App Version', placeholder: '1.0.0', icon: 'information-circle-outline' },
    { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...', icon: 'logo-facebook' },
    { key: 'twitter_url', label: 'Twitter URL', placeholder: 'https://twitter.com/...', icon: 'logo-twitter' },
    { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...', icon: 'logo-instagram' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', placeholder: 'false', icon: 'construct-outline' },
];

export default function SettingsScreen() {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);

    const { data, isLoading } = useAdminSettings();
    const updateSettings = useUpdateSettings();

    useEffect(() => {
        if (data?.config) {
            setFormData(data.config);
            setHasChanges(false);
        }
    }, [data]);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            const settings = Object.entries(formData).map(([key, value]) => ({
                key,
                value,
            }));
            await updateSettings.mutateAsync(settings);
            setHasChanges(false);
            if (Platform.OS === 'web') {
                alert('Settings saved successfully!');
            } else {
                Alert.alert('Success', 'Settings saved successfully!');
            }
        } catch (error) {
            if (Platform.OS === 'web') {
                alert('Failed to save settings');
            } else {
                Alert.alert('Error', 'Failed to save settings');
            }
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Global Settings</Text>
                    <Text style={styles.subtitle}>Configure app-wide settings and social links</Text>
                </View>

                {/* Loading */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5A31F4" />
                    </View>
                ) : (
                    <>
                        {/* Settings Form */}
                        <View style={styles.formContainer}>
                            {SETTING_FIELDS.map((field) => (
                                <View key={field.key} style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{field.label}</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name={field.icon} size={20} color="#888" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={formData[field.key] || ''}
                                            onChangeText={(text) => handleChange(field.key, text)}
                                            placeholder={field.placeholder}
                                            placeholderTextColor="#AAA"
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Action Row */}
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
                                    updateSettings.isPending && styles.saveButtonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={updateSettings.isPending}
                            >
                                {updateSettings.isPending ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#FFF" />
                                        <Text style={styles.saveButtonText}>Update Settings</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#5A31F4" />
                            <Text style={styles.infoText}>
                                Changes to these settings will take effect immediately across the platform.
                            </Text>
                        </View>
                    </>
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
        maxWidth: 800,
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
    loadingContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#333',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0EAFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#5A31F4',
        lineHeight: 20,
    },
});
