import React from 'react';
import { Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@shopify/restyle';
import { useQuery } from '@tanstack/react-query';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Theme } from '../../theme/theme';
import api from '../../lib/api';

interface OfferDetailsModalProps {
    visible: boolean;
    offerId: string | null;
    onClose: () => void;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
    };
}

const fetchOfferDetails = async (offerId: string) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
};

const fetchVendorReviews = async (vendorId: string) => {
    const response = await api.get(`/vendors/${vendorId}/reviews`);
    return response.data;
};

const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ visible, offerId, onClose }) => {
    const theme = useTheme<Theme>();

    const { data: offer } = useQuery({
        queryKey: ['offer', offerId],
        queryFn: () => fetchOfferDetails(offerId!),
        enabled: !!offerId,
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['vendorReviews', offer?.vendor?.id],
        queryFn: () => fetchVendorReviews(offer?.vendor?.id),
        enabled: !!offer?.vendor?.id,
    });

    if (!offer) return null;

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color={i <= rating ? '#FFB800' : theme.colors.gray}
                />
            );
        }
        return <Box flexDirection="row" gap="xs">{stars}</Box>;
    };

    const getTypeLabel = () => {
        if (offer.discountPercentage) return `${offer.discountPercentage}% OFF`;
        if (offer.couponCode) return offer.couponCode;
        if (offer.voucherValue) return `৳${offer.voucherValue}`;
        return offer.type;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="mainBackground">
                {/* Header */}
                <Box
                    backgroundColor="white"
                    paddingHorizontal="m"
                    paddingTop={Platform.OS === 'ios' ? 'xl' : 'm'}
                    paddingBottom="m"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                        <Box
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="offWhite"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </Box>
                    </TouchableOpacity>
                    <Text variant="subheader">Offer Details</Text>
                    <Box width={40} />
                </Box>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Hero Image */}
                    {offer.image && (
                        <Box height={300} backgroundColor="gray">
                            <Image
                                source={{ uri: offer.image }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                            <Box
                                position="absolute"
                                bottom={16}
                                right={16}
                                backgroundColor="primary"
                                paddingHorizontal="m"
                                paddingVertical="s"
                                borderRadius={12}
                            >
                                <Text fontSize={16} fontWeight="bold" color="textInverted">
                                    {getTypeLabel()}
                                </Text>
                            </Box>
                        </Box>
                    )}

                    {/* Content */}
                    <Box padding="m">
                        {/* Title & Status */}
                        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="m">
                            <Box flex={1}>
                                <Text variant="header" fontSize={24}>
                                    {offer.title}
                                </Text>
                            </Box>
                            <Box
                                backgroundColor={offer.isActive ? 'cardPrimaryBackground' : 'darkGray'}
                                paddingHorizontal="m"
                                paddingVertical="xs"
                                borderRadius={20}
                            >
                                <Text fontSize={12} fontWeight="600" color="textInverted">
                                    {offer.isActive ? 'Active' : 'Inactive'}
                                </Text>
                            </Box>
                        </Box>

                        {/* Description */}
                        <Box
                            backgroundColor="offWhite"
                            padding="m"
                            borderRadius={12}
                            marginBottom="m"
                        >
                            <Text fontSize={15} lineHeight={22}>
                                {offer.description}
                            </Text>
                        </Box>

                        {/* Stats Grid */}
                        <Box flexDirection="row" flexWrap="wrap" gap="s" marginBottom="l">
                            <Box
                                flex={1}
                                minWidth="45%"
                                backgroundColor="white"
                                padding="m"
                                borderRadius={12}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <Ionicons name="eye-outline" size={24} color={theme.colors.primary} />
                                <Text fontSize={24} fontWeight="bold" marginTop="s">
                                    {offer.views}
                                </Text>
                                <Text fontSize={12} color="darkGray">
                                    Total Views
                                </Text>
                            </Box>

                            <Box
                                flex={1}
                                minWidth="45%"
                                backgroundColor="white"
                                padding="m"
                                borderRadius={12}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <Ionicons name="pricetag-outline" size={24} color={theme.colors.secondary} />
                                <Text fontSize={24} fontWeight="bold" marginTop="s">
                                    {offer.type}
                                </Text>
                                <Text fontSize={12} color="darkGray">
                                    Offer Type
                                </Text>
                            </Box>
                        </Box>

                        {/* Reviews Section */}
                        <Text variant="subheader" fontSize={20} marginBottom="m">
                            Vendor Reviews ({reviews.length})
                        </Text>

                        {reviews.length === 0 ? (
                            <Box
                                backgroundColor="offWhite"
                                padding="l"
                                borderRadius={12}
                                alignItems="center"
                            >
                                <Ionicons name="chatbubble-outline" size={48} color={theme.colors.darkGray} />
                                <Text fontSize={14} color="darkGray" marginTop="m" textAlign="center">
                                    No reviews yet
                                </Text>
                            </Box>
                        ) : (
                            reviews.map((review: Review) => (
                                <Box
                                    key={review.id}
                                    backgroundColor="white"
                                    padding="m"
                                    borderRadius={12}
                                    marginBottom="s"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 2,
                                        elevation: 1,
                                    }}
                                >
                                    <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
                                        {renderStars(review.rating)}
                                        <Text fontSize={12} color="darkGray">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                    <Text fontSize={14} lineHeight={20}>
                                        {review.comment}
                                    </Text>
                                    <Text fontSize={12} color="darkGray" marginTop="xs">
                                        by {review.user.email}
                                    </Text>
                                </Box>
                            ))
                        )}
                    </Box>
                </ScrollView>
            </Box>
        </Modal>
    );
};

export default OfferDetailsModal;
