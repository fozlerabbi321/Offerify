import React, { useState, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import Box from '../../src/components/ui/Box';
import VendorOfferList from '../../src/components/vendor/VendorOfferList';
import DeleteConfirmDialog from '../../src/components/vendor/DeleteConfirmDialog';
import api from '../../src/lib/api';

interface VendorOffer {
    id: string;
    title: string;
    description: string;
    type: 'discount' | 'coupon' | 'voucher';
    discountPercentage?: number;
    couponCode?: string;
    voucherValue?: number;
    image?: string;
    imagePath?: string;
    isActive: boolean;
    views: number;
    createdAt: string;
    category?: {
        id: string;
        name: string;
    };
    city?: {
        id: number;
        name: string;
    };
}

// API functions
const fetchMyOffers = async (): Promise<VendorOffer[]> => {
    const response = await api.get('/offers/my-offers');
    return response.data || [];
};

const deleteOfferApi = async (offerId: string) => {
    const response = await api.delete(`/offers/${offerId}`);
    return response;
};

export default function VendorOffersScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // State for delete dialog - using refs to prevent state reset issues
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState<VendorOffer | null>(null);

    // Query for fetching offers
    const { data: offers = [], isLoading, refetch } = useQuery({
        queryKey: ['vendorOffers'],
        queryFn: fetchMyOffers,
    });

    // Mutation for deleting offers
    const deleteMutation = useMutation({
        mutationFn: deleteOfferApi,
        onSuccess: () => {
            // Close dialog first
            setDeleteDialogVisible(false);
            setOfferToDelete(null);

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['vendorOffers'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });

            // Show success message
            setTimeout(() => {
                if (Platform.OS === 'web') {
                    window.alert('Offer deleted successfully!');
                } else {
                    Alert.alert('Success', 'Offer deleted successfully!');
                }
            }, 100);
        },
        onError: (error: any) => {
            console.error('Delete offer error:', error);
            setDeleteDialogVisible(false);
            setOfferToDelete(null);

            const errorMessage = error.response?.data?.message || 'Failed to delete offer';
            setTimeout(() => {
                if (Platform.OS === 'web') {
                    window.alert(`Error: ${errorMessage}`);
                } else {
                    Alert.alert('Error', errorMessage);
                }
            }, 100);
        },
    });

    const handleView = useCallback((offer: VendorOffer) => {
        router.push(`/offer/${offer.id}`);
    }, [router]);

    const handleEdit = useCallback((offer: VendorOffer) => {
        router.push({
            pathname: '/vendor/post',
            params: { editId: offer.id },
        });
    }, [router]);

    const handleDelete = useCallback((offer: VendorOffer) => {
        // Set state synchronously
        setOfferToDelete(offer);
        setDeleteDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (offerToDelete) {
            deleteMutation.mutate(offerToDelete.id);
        }
    }, [offerToDelete, deleteMutation]);

    const cancelDelete = useCallback(() => {
        setDeleteDialogVisible(false);
        setOfferToDelete(null);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Memoize dialog props to prevent unnecessary re-renders
    const dialogProps = useMemo(() => ({
        visible: deleteDialogVisible,
        offerTitle: offerToDelete?.title || '',
        isDeleting: deleteMutation.isPending,
        onConfirm: confirmDelete,
        onCancel: cancelDelete,
    }), [deleteDialogVisible, offerToDelete?.title, deleteMutation.isPending, confirmDelete, cancelDelete]);

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <VendorOfferList
                offers={offers}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <DeleteConfirmDialog
                visible={dialogProps.visible}
                offerTitle={dialogProps.offerTitle}
                isDeleting={dialogProps.isDeleting}
                onConfirm={dialogProps.onConfirm}
                onCancel={dialogProps.onCancel}
            />
        </Box>
    );
}
