import React from 'react';
import { TouchableOpacity, DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Image } from 'expo-image';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface Vendor {
    id: string;
    businessName: string;
}

interface Offer {
    id: string;
    title: string;
    description: string;
    image?: string;
    discountPercentage?: number;
    type: 'discount' | 'coupon' | 'voucher';
    vendor?: Vendor;
}

const OfferCard = ({ offer, width = '100%' }: { offer: Offer, width?: DimensionValue }) => {
    const theme = useTheme<Theme>();
    const router = useRouter();

    const vendorName = offer.vendor?.businessName || 'Unknown Vendor';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={{ width }}
            onPress={() => router.push(`/offer/${offer.id}`)}
        >
            <Box
                width="100%"
                height={220}
                backgroundColor="white"
                borderRadius={16}
                overflow="hidden"
                shadowColor="black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.08}
                shadowRadius={8}
                elevation={3}
            >
                {/* Image Section */}
                <Box height={130} backgroundColor="gray" position="relative">
                    {offer.image && (
                        <Image
                            source={{ uri: offer.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    )}
                    {/* Smaller OFF Badge */}
                    {offer.discountPercentage && (
                        <Box
                            position="absolute"
                            top={8}
                            left={8}
                            backgroundColor="secondary"
                            paddingHorizontal="s"
                            paddingVertical="xs"
                            borderRadius={6}
                            flexDirection="row"
                            alignItems="center"
                        >
                            <Text variant="caption" fontSize={10} fontWeight="bold" color="white">
                                {offer.discountPercentage}% OFF
                            </Text>
                        </Box>
                    )}
                </Box>
                {/* Content Section */}
                <Box padding="s" flex={1} justifyContent="space-between">
                    <Box>
                        <Text variant="body" fontSize={14} fontWeight="600" numberOfLines={1}>
                            {offer.title}
                        </Text>
                        <Text variant="caption" fontSize={11} color="darkGray" numberOfLines={1} marginTop="xs">
                            {offer.description}
                        </Text>
                    </Box>
                    {/* Vendor Name Row */}
                    <Box flexDirection="row" alignItems="center" marginTop="xs">
                        <Ionicons name="storefront-outline" size={12} color={theme.colors.grayMedium} />
                        <Text variant="caption" fontSize={11} color="grayMedium" marginLeft="xs" numberOfLines={1}>
                            {vendorName}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </TouchableOpacity>
    );
};

export default OfferCard;
