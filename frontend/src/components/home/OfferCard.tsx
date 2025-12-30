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
                height={230}
                backgroundColor="cardBackground"
                borderRadius="l"
                overflow="hidden"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 15,
                    elevation: 5,
                }}
            >
                {/* Image Section */}
                <Box height={140} backgroundColor="gray" position="relative">
                    {offer.image && (
                        <Image
                            source={{ uri: offer.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    )}

                    {/* Glassmorphism Badge */}
                    {offer.discountPercentage && (
                        <Box
                            position="absolute"
                            top={12}
                            left={12}
                            backgroundColor="modalBackground"
                            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backdropFilter: 'blur(10px)' } as any}
                            flexDirection="row"
                            alignItems="center"
                        >
                            <Text variant="tiny" fontWeight="700" color="white">
                                {offer.discountPercentage}% OFF
                            </Text>
                        </Box>
                    )}

                    {/* Type Badge */}
                    <Box
                        position="absolute"
                        bottom={12}
                        right={12}
                        backgroundColor="white"
                        paddingHorizontal="s"
                        paddingVertical="xxs"
                        borderRadius="s"
                    >
                        <Text variant="tiny" fontWeight="700" color="primary" style={{ textTransform: 'uppercase' }}>
                            {offer.type}
                        </Text>
                    </Box>
                </Box>

                {/* Content Section */}
                <Box padding="s" flex={1} justifyContent="space-between">
                    <Box>
                        <Text variant="sectionTitle" fontSize={15} numberOfLines={1}>
                            {offer.title}
                        </Text>
                        <Text variant="caption" numberOfLines={1} marginTop="xxs">
                            {offer.description}
                        </Text>
                    </Box>

                    {/* Vendor Name Row */}
                    <Box flexDirection="row" alignItems="center">
                        <Box
                            width={20}
                            height={20}
                            borderRadius="xs"
                            backgroundColor="accent2"
                            justifyContent="center"
                            alignItems="center"
                            marginRight="xs"
                        >
                            <Ionicons name="storefront" size={12} color={theme.colors.primary} />
                        </Box>
                        <Text variant="tiny" color="textMuted" numberOfLines={1}>
                            {vendorName}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </TouchableOpacity>
    );
};

export default OfferCard;
