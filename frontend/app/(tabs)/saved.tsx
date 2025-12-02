import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import theme from '../../src/theme/theme';

const fetchFavorites = async () => {
    const response = await api.get('/account/favorites');
    return response.data.data;
};

export default function SavedScreen() {
    const router = useRouter();
    const { data: favorites, isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: fetchFavorites,
    });

    const renderItem = ({ item }: { item: any }) => {
        const offer = item.offer;
        return (
            <TouchableOpacity onPress={() => router.push(`/offer/${offer.id}`)}>
                <Box
                    flexDirection="row"
                    padding="m"
                    backgroundColor="mainBackground"
                    marginBottom="s"
                    borderRadius={8}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                >
                    <Image
                        source={{ uri: offer.image || 'https://via.placeholder.com/100' }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                        contentFit="cover"
                    />
                    <Box marginLeft="m" flex={1} justifyContent="center">
                        <Text variant="subheader" fontSize={16} marginBottom="xs">
                            {offer.title}
                        </Text>
                        <Text variant="body" color="primary" fontWeight="bold">
                            ${offer.discountedPrice || offer.price}
                        </Text>
                        <Text variant="body" fontSize={12} color="gray" marginTop="xs">
                            {offer.vendor?.businessName}
                        </Text>
                    </Box>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <Box flex={1} backgroundColor="mainBackground" padding="m">
            <Text variant="header" marginBottom="m">Saved Items</Text>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text>No saved items yet.</Text>}
                />
            )}
        </Box>
    );
}
