import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminReviews, useDeleteReview, Review } from '../../src/api/admin';

export default function ReviewsScreen() {
    const [page, setPage] = useState(1);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const { data, isLoading } = useAdminReviews({ page, limit: 10 });
    const deleteReview = useDeleteReview();

    const handleDeletePress = (review: Review) => {
        setSelectedReview(review);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!selectedReview) return;
        try {
            await deleteReview.mutateAsync(selectedReview.id);
            setDeleteModalVisible(false);
            setSelectedReview(null);
        } catch (error) {
            if (Platform.OS === 'web') {
                alert('Failed to delete review');
            } else {
                Alert.alert('Error', 'Failed to delete review');
            }
        }
    };

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                    />
                ))}
            </View>
        );
    };

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
                    <Text style={styles.title}>Review Moderation</Text>
                    <Text style={styles.subtitle}>Monitor and moderate platform reviews</Text>
                </View>

                {/* Loading */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5A31F4" />
                    </View>
                ) : (
                    <>
                        {/* Results Info */}
                        <View style={styles.resultsInfo}>
                            <Text style={styles.resultsText}>
                                Showing {data?.items.length || 0} of {data?.meta.total || 0} reviews
                            </Text>
                        </View>

                        {/* Review Cards */}
                        <View style={styles.reviewsContainer}>
                            {data?.items.map((review: Review) => (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>
                                                    {review.user?.name?.[0]?.toUpperCase() ||
                                                        review.user?.email?.[0]?.toUpperCase() || 'U'}
                                                </Text>
                                            </View>
                                            <View style={styles.userDetails}>
                                                <Text style={styles.userName}>
                                                    {review.user?.name || review.user?.email || 'Unknown User'}
                                                </Text>
                                                <Text style={styles.vendorName}>
                                                    Reviewed: {review.vendor?.businessName || 'Unknown Vendor'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Pressable
                                            style={styles.deleteButton}
                                            onPress={() => handleDeletePress(review)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#E53935" />
                                        </Pressable>
                                    </View>

                                    <View style={styles.ratingRow}>
                                        {renderStars(review.rating)}
                                        <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
                                    </View>

                                    {review.comment && (
                                        <Text style={styles.comment}>{review.comment}</Text>
                                    )}
                                </View>
                            ))}

                            {data?.items.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CCC" />
                                    <Text style={styles.emptyTitle}>No Reviews</Text>
                                    <Text style={styles.emptyText}>There are no reviews to moderate yet.</Text>
                                </View>
                            )}
                        </View>

                        {/* Pagination */}
                        {data?.meta && data.meta.totalPages > 1 && (
                            <View style={styles.pagination}>
                                <Pressable
                                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                >
                                    <Ionicons name="chevron-back" size={20} color={page === 1 ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                                <Text style={styles.pageInfo}>
                                    Page {page} of {data.meta.totalPages}
                                </Text>
                                <Pressable
                                    style={[styles.pageButton, page === data.meta.totalPages && styles.pageButtonDisabled]}
                                    onPress={() => setPage(Math.min(data.meta.totalPages, page + 1))}
                                    disabled={page === data.meta.totalPages}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={page === data.meta.totalPages ? '#CCC' : '#5A31F4'} />
                                </Pressable>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="warning" size={40} color="#E53935" />
                        </View>
                        <Text style={styles.modalTitle}>Delete Review?</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.confirmDeleteButton]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.confirmDeleteText}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    loadingContainer: {
        padding: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsInfo: {
        marginBottom: 16,
    },
    resultsText: {
        color: '#666',
        fontSize: 14,
    },
    reviewsContainer: {
        gap: 16,
    },
    reviewCard: {
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
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#5A31F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 2,
    },
    vendorName: {
        fontSize: 13,
        color: '#888',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    dateText: {
        fontSize: 13,
        color: '#888',
    },
    comment: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmDeleteButton: {
        backgroundColor: '#E53935',
    },
    confirmDeleteText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },
});
