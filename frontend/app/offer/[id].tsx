import React from 'react';
import { ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import OfferMapPreview from '../../src/components/OfferMapPreview';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

const { width } = Dimensions.get('window');

const fetchOffer = async (id: string) => {
    const response = await api.get(`/offers/${id}`);
    return response.data.data;
};

const claimOffer = async (id: string) => {
    const response = await api.post(`/redemptions/${id}/claim`);
    return response.data;
};

export default function OfferDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: offer, isLoading, error } = useQuery({
        queryKey: ['offer', id],
        queryFn: () => fetchOffer(id!),
        enabled: !!id,
    });

    const claimMutation = useMutation({
        mutationFn: claimOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            Alert.alert('Success', 'Voucher claimed successfully!', [
                { text: 'Go to Wallet', onPress: () => router.push('/(tabs)/wallet') },
                { text: 'OK' }
            ]);
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.message || 'Failed to claim voucher');
        },
    });

    if (isLoading) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="mainBackground">
                <Text>Loading...</Text>
            </Box>
        );
    }

    if (error || !offer) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="mainBackground">
                <Text>Error loading offer</Text>
            </Box>
        );
    }

    const hasCoordinates = offer.latitude && offer.longitude;

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{ title: 'Offer Details', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <Image
                    source={{ uri: offer.image || 'https://via.placeholder.com/400x300' }}
                    style={{ width: '100%', height: 300 }}
                    contentFit="cover"
                />

                <Box padding="m">
                    <Text variant="header" marginBottom="s">{offer.title}</Text>

                    <Box flexDirection="row" alignItems="center" marginBottom="m">
                        <Text variant="subheader" color="primary" marginRight="s">
                            ${offer.discountedPrice || offer.price}
                        </Text>
                        {offer.discountedPrice && (
                            <Text
                                variant="body"
                                color="gray"
                                style={{ textDecorationLine: 'line-through' }}
                            >
                                ${offer.price}
                            </Text>
                        )}
                    </Box>

                    <Box flexDirection="row" alignItems="center" marginBottom="l">
                        <Ionicons name="storefront-outline" size={20} color={theme.colors.text} />
                        <Text variant="body" marginLeft="s" fontWeight="600">
                            {offer.vendor?.businessName || 'Vendor'}
                        </Text>
                    </Box>

                    <Text variant="body" marginBottom="l">
                        {offer.description}
                    </Text>

                    {hasCoordinates && (
                        <OfferMapPreview
                            latitude={parseFloat(offer.latitude)}
                            longitude={parseFloat(offer.longitude)}
                        />
                    )}
                </Box>
            </ScrollView>

            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                padding="m"
                backgroundColor="mainBackground"
                borderTopWidth={1}
                borderTopColor="gray"
                paddingBottom="l"
            >
                <TouchableOpacity
                    onPress={() => claimMutation.mutate(id!)}
                    disabled={claimMutation.isPending}
                >
                    <Box
                        backgroundColor="primary"
                        padding="m"
                        borderRadius={8}
                        alignItems="center"
                        opacity={claimMutation.isPending ? 0.7 : 1}
                    >
                        <Text color="textInverted" fontWeight="bold" fontSize={18}>
                            {claimMutation.isPending ? 'Claiming...' : 'Claim Voucher'}
                        </Text>
                    </Box>
                </TouchableOpacity>
            </Box>
        </Box>
    );
}
