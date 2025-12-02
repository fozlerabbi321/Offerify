import React from 'react';
import Box from './ui/Box';
import Text from './ui/Text';

interface FullScreenMapProps {
    offers: any[];
}

export default function FullScreenMap({ offers }: FullScreenMapProps) {
    return (
        <Box flex={1} justifyContent="center" alignItems="center">
            <Text variant="header" marginBottom="m">Map View</Text>
            <Text variant="body" color="gray">
                Map is currently optimized for mobile devices.
            </Text>
            <Text variant="body" color="gray">
                {offers?.length || 0} offers available near you.
            </Text>
            <Text variant="body" color="gray" marginTop="s">
                Please use the mobile app for the best experience.
            </Text>
        </Box>
    );
}
