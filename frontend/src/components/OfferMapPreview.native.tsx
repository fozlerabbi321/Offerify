import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Box from './ui/Box';
import theme from '../theme/theme';

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
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
        >
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
            >
                <Marker
                    coordinate={{
                        latitude,
                        longitude,
                    }}
                />
            </MapView>
        </Box>
    );
}
