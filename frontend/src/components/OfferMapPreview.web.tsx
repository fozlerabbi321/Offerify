import React from 'react';
import Box from './ui/Box';
import Text from './ui/Text';

interface OfferMapPreviewProps {
    latitude: number;
    longitude: number;
}

export default function OfferMapPreview({ latitude, longitude }: OfferMapPreviewProps) {
    return (
        <Box
            height={200}
            borderRadius={12}
            overflow="hidden"
            marginBottom="l"
            backgroundColor="cardPrimaryBackground"
            justifyContent="center"
            alignItems="center"
        >
            <Text variant="body" color="gray">
                Map preview not available on web
            </Text>
            <Text variant="body" fontSize={12} color="gray" marginTop="s">
                Lat: {latitude}, Long: {longitude}
            </Text>
        </Box>
    );
}
