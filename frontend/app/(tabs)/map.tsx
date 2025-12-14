import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import FullScreenMap from '../../src/components/FullScreenMap';
import { useLocationStore } from '../../src/store/location.store';

const fetchOffers = async (cityId?: number) => {
    try {
        const params = cityId ? { cityId } : {};
        const response = await api.get('/offers', { params });
        console.log('Offers API response:', response);
        console.log('Offers data:', response.data);

        // Handle both wrapped ({ data: { data: [...] } }) and unwrapped ({ data: [...] }) responses
        const offers = Array.isArray(response.data)
            ? response.data
            : (response.data.data || []);

        console.log('Extracted offers:', offers);
        console.log('Total offers count:', offers.length);

        // Debug: Check how many offers have coordinates
        const offersWithCoords = offers.filter((o: any) => {
            const coords = o.vendor?.location?.coordinates || o.city?.centerPoint?.coordinates;
            return coords && coords.length === 2;
        });
        console.log('Offers with valid coordinates:', offersWithCoords.length);

        return offers;
    } catch (error) {
        console.error('Failed to fetch offers:', error);
        return [];
    }
};

export default function MapScreen() {
    const { cityId } = useLocationStore();

    const { data: offers, isLoading } = useQuery({
        queryKey: ['offers', cityId],
        queryFn: () => fetchOffers(cityId || undefined),
    });

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <FullScreenMap offers={offers} />
            {isLoading && (
                <Box
                    position="absolute"
                    top={50}
                    left={20}
                    right={20}
                    padding="m"
                    backgroundColor="mainBackground"
                    borderRadius={8}
                    opacity={0.8}
                    alignItems="center"
                >
                    <Text>Loading offers...</Text>
                </Box>
            )}
        </Box>
    );
}
