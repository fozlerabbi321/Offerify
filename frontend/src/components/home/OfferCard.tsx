import React from 'react';
import { TouchableOpacity } from 'react-native';
import Box from '../ui/Box';
import Text from '../ui/Text';
import { Image } from 'expo-image';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

interface Offer {
    id: string;
    title: string;
    description: string;
    image?: string;
    discountPercentage?: number;
    type: 'discount' | 'coupon' | 'voucher';
}

const OfferCard = ({ offer }: { offer: Offer }) => {
    const theme = useTheme<Theme>();

    return (
        <TouchableOpacity activeOpacity={0.9}>
            <Box
                width={200}
                height={240}
                backgroundColor="white"
                borderRadius={16}
                marginRight="m"
                overflow="hidden"
                shadowColor="black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.05}
                shadowRadius={4}
                elevation={2}
            >
                <Box height={140} backgroundColor="gray" position="relative">
                    {offer.image && (
                        <Image
                            source={{ uri: offer.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    )}
                    {offer.discountPercentage && (
                        <Box
                            position="absolute"
                            top={10}
                            left={10}
                            backgroundColor="secondary"
                            paddingHorizontal="s"
                            paddingVertical="xs"
                            borderRadius={8}
                        >
                            <Text variant="body" fontSize={12} fontWeight="bold" color="white">
                                {offer.discountPercentage}% OFF
                            </Text>
                        </Box>
                    )}
                </Box>
                <Box padding="m">
                    <Text variant="subheader" fontSize={16} numberOfLines={1}>{offer.title}</Text>
                    <Text variant="body" fontSize={12} color="darkGray" numberOfLines={2} marginTop="xs">
                        {offer.description}
                    </Text>
                </Box>
            </Box>
        </TouchableOpacity>
    );
};

export default OfferCard;
