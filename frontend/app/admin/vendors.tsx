import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAdminVendors, Vendor } from '../../src/api/admin';

export default function VendorsScreen() {
    const { data: vendorsData, isLoading, error } = useAdminVendors();
    const vendors = vendorsData?.items || [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Vendor Management</Text>
                    <Text style={styles.subtitle}>View and manage platform vendors</Text>
                </View>

                {/* Note */}
                <View style={styles.noteBox}>
                    <Ionicons name="information-circle" size={20} color="#5A31F4" />
                    <Text style={styles.noteText}>
                        Vendor approval/rejection functionality coming soon. Currently showing all registered vendors.
                    </Text>
                </View>

                {/* Loading */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5A31F4" />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color="#E53935" />
                        <Text style={styles.errorTitle}>Failed to load vendors</Text>
                    </View>
                ) : (
                    <View style={styles.vendorsContainer}>
                        {vendors.map((vendor: Vendor) => (
                            <View key={vendor.id} style={styles.vendorCard}>
                                <View style={styles.vendorHeader}>
                                    <View style={styles.logoPlaceholder}>
                                        <Ionicons name="storefront" size={24} color="#5A31F4" />
                                    </View>
                                    <View style={styles.vendorInfo}>
                                        <Text style={styles.vendorName}>{vendor.businessName}</Text>
                                        <Text style={styles.vendorSlug}>@{vendor.slug}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>Active</Text>
                                    </View>
                                </View>

                                {vendor.description && (
                                    <Text style={styles.vendorDescription} numberOfLines={2}>
                                        {vendor.description}
                                    </Text>
                                )}

                                <View style={styles.vendorMeta}>
                                    {vendor.user?.email && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="mail-outline" size={14} color="#888" />
                                            <Text style={styles.metaText}>{vendor.user.email}</Text>
                                        </View>
                                    )}
                                    {vendor.city?.name && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="location-outline" size={14} color="#888" />
                                            <Text style={styles.metaText}>{vendor.city.name}</Text>
                                        </View>
                                    )}
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#888" />
                                        <Text style={styles.metaText}>Joined {formatDate(vendor.createdAt)}</Text>
                                    </View>
                                </View>

                                <View style={styles.vendorActions}>
                                    <Pressable style={styles.viewButton}>
                                        <Ionicons name="eye-outline" size={18} color="#5A31F4" />
                                        <Text style={styles.viewButtonText}>View Profile</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )) || (
                                <View style={styles.emptyState}>
                                    <Ionicons name="storefront-outline" size={48} color="#CCC" />
                                    <Text style={styles.emptyTitle}>No Vendors</Text>
                                    <Text style={styles.emptyText}>No vendors registered yet.</Text>
                                </View>
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
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0EAFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    noteText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#5A31F4',
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E53935',
        marginTop: 16,
    },
    vendorsContainer: {
        gap: 16,
    },
    vendorCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    vendorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F0EAFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vendorInfo: {
        flex: 1,
        marginLeft: 14,
    },
    vendorName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 2,
    },
    vendorSlug: {
        fontSize: 13,
        color: '#888',
    },
    statusBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    vendorDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    vendorMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#888',
    },
    vendorActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0EAFF',
        borderRadius: 8,
    },
    viewButtonText: {
        color: '#5A31F4',
        fontWeight: '500',
        marginLeft: 6,
    },
    emptyState: {
        alignItems: 'center',
        padding: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
    },
});
