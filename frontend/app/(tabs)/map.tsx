import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '../../src/components/ui/Box';
import Text from '../../src/components/ui/Text';
import api from '../../src/lib/api';
import FullScreenMap from '../../src/components/FullScreenMap';

const fetchOffers = async () => {
    const response = await api.get('/offers');
    return response.data.data;
};

export default function MapScreen() {
    const { data: offers, isLoading } = useQuery({
        queryKey: ['offers'],
        queryFn: fetchOffers,
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
