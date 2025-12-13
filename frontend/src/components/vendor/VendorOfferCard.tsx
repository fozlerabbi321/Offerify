import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@shopify/restyle';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Theme } from '../../theme/theme';

interface VendorOffer {
    id: string;
    title: string;
    description: string;
    type: 'discount' | 'coupon' | 'voucher';
    discountPercentage?: number;
    couponCode?: string;
    voucherValue?: number;
    image?: string;
    isActive: boolean;
    views: number;
    createdAt: string;
}

interface VendorOfferCardProps {
    offer: VendorOffer;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const VendorOfferCard: React.FC<VendorOfferCardProps> = ({ offer, onView, onEdit, onDelete }) => {
    const theme = useTheme<Theme>();

    // Get gradient colors based on offer type
    const getTypeGradient = () => {
        switch (offer.type) {
            case 'discount':
                return { start: '#FF6B6B', end: '#FF8E53' };
            case 'coupon':
                return { start: '#4CAF50', end: '#81C784' };
            case 'voucher':
                return { start: '#9C27B0', end: '#BA68C8' };
            default:
                return { start: theme.colors.primary, end: theme.colors.secondary };
        }
    };

    const gradient = getTypeGradient();
    const typeLabel = offer.type.charAt(0).toUpperCase() + offer.type.slice(1);

    const getOfferValue = () => {
        if (offer.discountPercentage) return `${offer.discountPercentage}% OFF`;
        if (offer.couponCode) return offer.couponCode;
        if (offer.voucherValue) return `৳${offer.voucherValue}`;
        return typeLabel;
    };

    return (
        <Box
            marginBottom="m"
            backgroundColor="white"
            borderRadius={16}
            overflow="hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
            }}
        >
            {/* Image Section with Overlay */}
            <Box height={180} backgroundColor="gray" position="relative">
                {offer.image && (
                    <Image
                        source={{ uri: offer.image }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                )}

                {/* Status Badge */}
                <Box
                    position="absolute"
                    top={12}
                    left={12}
                    backgroundColor={offer.isActive ? 'cardPrimaryBackground' : 'darkGray'}
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    borderRadius={20}
                    flexDirection="row"
                    alignItems="center"
                >
                    <Box
                        width={8}
                        height={8}
                        borderRadius={4}
                        backgroundColor={offer.isActive ? 'white' : 'gray'}
                        marginRight="xs"
                    />
                    <Text fontSize={12} fontWeight="600" color="textInverted">
                        {offer.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </Box>

                {/* Type Badge */}
                <Box
                    position="absolute"
                    top={12}
                    right={12}
                    style={{
                        backgroundColor: gradient.start,
                    }}
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    borderRadius={8}
                >
                    <Text fontSize={12} fontWeight="bold" color="textInverted">
                        {getOfferValue()}
                    </Text>
                </Box>

                {/* Stats Overlay */}
                <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    paddingHorizontal="m"
                    paddingVertical="s"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box flexDirection="row" alignItems="center">
                        <Ionicons name="eye-outline" size={16} color="white" />
                        <Text fontSize={12} color="textInverted" marginLeft="xs">
                            {offer.views} views
                        </Text>
                    </Box>
                </Box>
            </Box>

            {/* Content Section */}
            <Box padding="m">
                <Text variant="subheader" fontSize={18} numberOfLines={1} marginBottom="xs">
                    {offer.title}
                </Text>
                <Text fontSize={14} color="darkGray" numberOfLines={2} marginBottom="m">
                    {offer.description}
                </Text>

                {/* Action Buttons */}
                <Box flexDirection="row" justifyContent="space-between" gap="s">
                    <TouchableOpacity
                        onPress={onView}
                        style={{ flex: 1 }}
                        activeOpacity={0.7}
                    >
                        <Box
                            backgroundColor="offWhite"
                            paddingVertical="s"
                            borderRadius={8}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                                borderWidth: 1,
                                borderColor: theme.colors.gray,
                            }}
                        >
                            <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
                            <Text fontSize={14} fontWeight="600" marginLeft="xs" color="primary">
                                View
                            </Text>
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onEdit}
                        style={{ flex: 1 }}
                        activeOpacity={0.7}
                    >
                        <Box
                            backgroundColor="primary"
                            paddingVertical="s"
                            borderRadius={8}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Ionicons name="create-outline" size={18} color="white" />
                            <Text fontSize={14} fontWeight="600" marginLeft="xs" color="textInverted">
                                Edit
                            </Text>
                        </Box>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onDelete}
                        activeOpacity={0.7}
                    >
                        <Box
                            backgroundColor="offWhite"
                            paddingHorizontal="m"
                            paddingVertical="s"
                            borderRadius={8}
                            alignItems="center"
                            justifyContent="center"
                            style={{
                                borderWidth: 1,
                                borderColor: theme.colors.error,
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>
        </Box>
    );
};

export default VendorOfferCard;
