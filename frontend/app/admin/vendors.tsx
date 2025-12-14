import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminVendors, useUpdateVendorStatus, useUpdateVendorProfile, useDeleteVendor, Vendor } from '../../src/api/admin';
import { Alert, Modal, TextInput, Image } from 'react-native';
import { useState } from 'react';

export default function VendorsScreen() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data: vendorsData, isLoading, error, refetch } = useAdminVendors({ page, limit: 10, search: search || undefined });
    const vendors = vendorsData?.items || [];
    const meta = vendorsData?.meta; // Access meta data for pagination

    const handleSearch = () => {
        setPage(1);
        refetch();
    };

    const updateStatus = useUpdateVendorStatus();
    const updateProfile = useUpdateVendorProfile();
    const deleteVendor = useDeleteVendor();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [editForm, setEditForm] = useState({ businessName: '', contactPhone: '' });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const handleStatusUpdate = async (status: string) => {
        if (!selectedVendor) return;
        try {
            await updateStatus.mutateAsync({ vendorId: selectedVendor.id, status });
            setStatusModalVisible(false);
            setSelectedVendor(null);
        } catch (error) {
            Alert.alert('Error', `Failed to ${status} vendor`);
        }
    };

    const openStatusModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setStatusModalVisible(true);
    };

    const openViewModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setViewModalVisible(true);
    };

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setEditForm({
            businessName: vendor.businessName,
            contactPhone: vendor.contactPhone || ''
        });
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editingVendor) return;
        try {
            await updateProfile.mutateAsync({
                vendorId: editingVendor.id,
                data: {
                    businessName: editForm.businessName,
                    contactPhone: editForm.contactPhone
                }
            });
            setEditModalVisible(false);
            setEditingVendor(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update vendor');
        }
    };

    const handleDelete = (vendorId: string) => {
        Alert.alert(
            'Delete Vendor',
            'Are you sure you want to delete this vendor? This will remove all their offers and data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVendor.mutateAsync(vendorId);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete vendor');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return { bg: '#D1FAE5', text: '#10B981' };
            case 'rejected': return { bg: '#FEE2E2', text: '#E53935' };
            default: return { bg: '#FEF3C7', text: '#D97706' };
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Vendor Management</Text>
                    <Text style={styles.subtitle}>View and manage platform vendors</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by business name..."
                            placeholderTextColor="#888"
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <Pressable style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </Pressable>
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
                        {/* Results Info */}
                        <View style={styles.resultsInfo}>
                            <Text style={styles.resultsText}>
                                Showing {vendors.length} of {meta?.total || 0} vendors
                            </Text>
                        </View>

                        {vendors.length > 0 ? (
                            vendors.map((vendor: Vendor) => (
                                <View key={vendor.id} style={styles.vendorCard}>
                                    <View style={styles.vendorHeader}>
                                        <View style={styles.logoPlaceholder}>
                                            <Ionicons name="storefront" size={24} color="#5A31F4" />
                                        </View>
                                        <View style={styles.vendorInfo}>
                                            <Text style={styles.vendorName}>{vendor.businessName}</Text>
                                            <Text style={styles.vendorSlug}>@{vendor.slug}</Text>
                                        </View>
                                        <Pressable onPress={() => openStatusModal(vendor)}>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vendor.status).bg }]}>
                                                <Text style={[styles.statusText, { color: getStatusColor(vendor.status).text }]}>
                                                    {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Pending'}
                                                </Text>
                                                <Ionicons name="chevron-down" size={12} color={getStatusColor(vendor.status).text} style={{ marginLeft: 4 }} />
                                            </View>
                                        </Pressable>
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
                                        <View style={styles.manageActions}>
                                            <Pressable onPress={() => openViewModal(vendor)} style={styles.iconButton}>
                                                <Ionicons name="eye" size={20} color="#5A31F4" />
                                            </Pressable>
                                            <Pressable onPress={() => handleEdit(vendor)} style={styles.iconButton}>
                                                <Ionicons name="pencil" size={20} color="#5A31F4" />
                                            </Pressable>
                                            <Pressable onPress={() => handleDelete(vendor.id)} style={styles.iconButton}>
                                                <Ionicons name="trash-outline" size={20} color="#E53935" />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="storefront-outline" size={48} color="#CCC" />
                                <Text style={styles.emptyTitle}>No Vendors</Text>
                                <Text style={styles.emptyText}>No vendors found matching your criteria.</Text>
                            </View>
                        )}

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <View style={styles.pagination}>
                                <Pressable
                                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                >
                                    <Ionicons name="chevron-back" size={20} color={page === 1 ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                                <Text style={styles.pageInfo}>
                                    Page {page} of {meta.totalPages}
                                </Text>
                                <Pressable
                                    style={[styles.pageButton, page === meta.totalPages && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.min(meta.totalPages, page + 1))}
                                    disabled={page === meta.totalPages}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={page === meta.totalPages ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}


                {/* Edit Modal */}
                <Modal
                    visible={editModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Vendor</Text>
                                <Pressable onPress={() => setEditModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </Pressable>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Business Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.businessName}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, businessName: text }))}
                                    placeholder="Business Name"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Contact Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.contactPhone}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, contactPhone: text }))}
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <Pressable
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveEdit}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Status Update Modal */}
                <Modal
                    visible={statusModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setStatusModalVisible(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
                        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Update Status</Text>
                                <Pressable onPress={() => setStatusModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </Pressable>
                            </View>

                            <Text style={styles.statusPrompt}>
                                Change status for <Text style={{ fontWeight: 'bold' }}>{selectedVendor?.businessName}</Text>:
                            </Text>

                            <View style={styles.statusOptions}>
                                <Pressable
                                    style={[styles.statusOption, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}
                                    onPress={() => handleStatusUpdate('approved')}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                    <Text style={[styles.statusOptionText, { color: '#10B981' }]}>Approve</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.statusOption, { backgroundColor: '#FEE2E2', borderColor: '#E53935' }]}
                                    onPress={() => handleStatusUpdate('rejected')}
                                >
                                    <Ionicons name="close-circle" size={24} color="#E53935" />
                                    <Text style={[styles.statusOptionText, { color: '#E53935' }]}>Reject</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.statusOption, { backgroundColor: '#FEF3C7', borderColor: '#D97706' }]}
                                    onPress={() => handleStatusUpdate('pending')}
                                >
                                    <Ionicons name="time" size={24} color="#D97706" />
                                    <Text style={[styles.statusOptionText, { color: '#D97706' }]}>Mark Pending</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* View Profile Modal */}
                <Modal
                    visible={viewModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setViewModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Vendor Details</Text>
                                    <Pressable onPress={() => setViewModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </Pressable>
                                </View>

                                {selectedVendor && (
                                    <View style={styles.profileDetails}>
                                        <View style={styles.profileHeader}>
                                            <View style={styles.profileLogo}>
                                                {selectedVendor.logoUrl ? (
                                                    <Image source={{ uri: selectedVendor.logoUrl }} style={styles.profileLogoImage} />
                                                ) : (
                                                    <Ionicons name="storefront" size={32} color="#5A31F4" />
                                                )}
                                            </View>
                                            <View style={styles.headerInfo}>
                                                <Text style={styles.headerName}>{selectedVendor.businessName}</Text>
                                                <Text style={styles.headerSlug}>@{selectedVendor.slug}</Text>
                                                <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 4, backgroundColor: getStatusColor(selectedVendor.status).bg }]}>
                                                    <Text style={[styles.statusText, { color: getStatusColor(selectedVendor.status).text }]}>
                                                        {selectedVendor.status.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Contact Information</Text>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="mail" size={16} color="#666" />
                                                <Text style={styles.detailText}>{selectedVendor.user?.email || 'N/A'}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="call" size={16} color="#666" />
                                                <Text style={styles.detailText}>{selectedVendor.contactPhone || 'N/A'}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="location" size={16} color="#666" />
                                                <Text style={styles.detailText}>{selectedVendor.city?.name || 'N/A'}</Text>
                                            </View>
                                        </View>

                                        {selectedVendor.description && (
                                            <View style={styles.detailSection}>
                                                <Text style={styles.sectionTitle}>About</Text>
                                                <Text style={styles.descriptionText}>{selectedVendor.description}</Text>
                                            </View>
                                        )}

                                        <View style={styles.detailSection}>
                                            <Text style={styles.sectionTitle}>Statistics</Text>
                                            <View style={styles.statsGrid}>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{selectedVendor.ratingAvg || '0.0'}</Text>
                                                    <Text style={styles.statLabel}>Rating</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{selectedVendor.reviewCount || '0'}</Text>
                                                    <Text style={styles.statLabel}>Reviews</Text>
                                                </View>
                                                <View style={styles.statItem}>
                                                    <Text style={styles.statValue}>{selectedVendor.followerCount || '0'}</Text>
                                                    <Text style={styles.statLabel}>Followers</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
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
    // Search Styles
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#333',
    },
    searchButton: {
        backgroundColor: '#5A31F4',
        paddingHorizontal: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },
    resultsInfo: {
        marginBottom: 16,
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    // Pagination Styles
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 16,
    },
    pageButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageInfo: {
        fontSize: 14,
        color: '#666',
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
        flexDirection: 'row',
        alignItems: 'center',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16,
    },
    approvalActions: {
        flexDirection: 'row',
        gap: 8,
    },
    manageActions: {
        flexDirection: 'row',
        gap: 16,
        marginLeft: 'auto',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    approveButton: {
        backgroundColor: '#10B981',
    },
    rejectButton: {
        backgroundColor: '#E53935',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
    },
    statusPrompt: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    statusOptions: {
        gap: 12,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    statusOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Profile View Styles
    profileDetails: {
        gap: 24,
    },
    profileHeader: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    profileLogo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#F0EAFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileLogoImage: {
        width: '100%',
        height: '100%',
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    headerSlug: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    detailSection: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailText: {
        fontSize: 15,
        color: '#444',
    },
    descriptionText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5A31F4',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    saveButton: {
        backgroundColor: '#5A31F4',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
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
