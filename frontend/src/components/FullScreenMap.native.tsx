import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import Box from './ui/Box';
import Text from './ui/Text';

interface FullScreenMapProps {
    offers: any[];
}

export default function FullScreenMap({ offers }: FullScreenMapProps) {
    const router = useRouter();

    const initialRegion = {
        latitude: 23.7925, // Default to Gulshan 1, Dhaka
        longitude: 90.4078,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
        >
            {offers?.map((offer: any) => {
                // Extract coordinates from vendor location or city center (PostGIS Point format)
                const coordinates = offer.vendor?.location?.coordinates ||
                    offer.city?.centerPoint?.coordinates;

                if (!coordinates || coordinates.length !== 2) return null;

                // GeoJSON format is [longitude, latitude]
                const [longitude, latitude] = coordinates;

                return (
                    <Marker
                        key={offer.id}
                        coordinate={{
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude),
                        }}
                        onCalloutPress={() => router.push(`/offer/${offer.id}`)}
                    >
                        <Callout>
                            <Box width={200} padding="s">
                                <Text variant="body" fontWeight="bold" numberOfLines={1}>
                                    {offer.title}
                                </Text>
                                <Text variant="body" color="primary">
                                    {offer.type === 'discount' && `${offer.discountPercentage}% OFF`}
                                    {offer.type === 'voucher' && `${offer.voucherValue} BDT OFF`}
                                    {offer.type === 'coupon' && `Code: ${offer.couponCode}`}
                                </Text>
                                <Text variant="body" fontSize={12} color="gray">
                                    Tap to view details
                                </Text>
                            </Box>
                        </Callout>
                    </Marker>
                );
            })}
        </MapView>
    );
}
