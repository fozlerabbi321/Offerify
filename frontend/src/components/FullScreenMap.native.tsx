import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text as RNText } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

interface FullScreenMapProps {
    offers: any[];
}

export default function FullScreenMap({ offers }: FullScreenMapProps) {
    const router = useRouter();

    const initialRegion = {
        latitude: 23.7925,
        longitude: 90.4078,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const getOfferLabel = (offer: any) => {
        if (offer.type === 'discount') return `${offer.discountPercentage}% OFF`;
        if (offer.type === 'voucher') return `৳${offer.voucherValue} OFF`;
        if (offer.type === 'coupon') return offer.couponCode;
        return 'Offer';
    };

    return (
        <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
        >
            {offers?.map((offer: any) => {
                const coordinates = offer.vendor?.location?.coordinates ||
                    offer.city?.centerPoint?.coordinates;

                if (!coordinates || coordinates.length !== 2) return null;

                const [longitude, latitude] = coordinates;

                return (
                    <Marker
                        key={offer.id}
                        coordinate={{
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude),
                        }}
                        onPress={() => router.push(`/offer/${offer.id}`)}
                    >
                        <TouchableOpacity
                            style={styles.markerContainer}
                            onPress={() => router.push(`/offer/${offer.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.markerContent}>
                                <RNText style={styles.offerLabel} numberOfLines={1}>
                                    {getOfferLabel(offer)}
                                </RNText>
                                <RNText style={styles.offerTitle} numberOfLines={1}>
                                    {offer.title}
                                </RNText>
                            </View>
                            <View style={styles.markerArrow} />
                        </TouchableOpacity>
                    </Marker>
                );
            })}
        </MapView>
    );
}

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
    },
    markerContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 100,
        maxWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#10b981',
    },
    offerLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10b981',
        textAlign: 'center',
    },
    offerTitle: {
        fontSize: 9,
        color: '#374151',
        textAlign: 'center',
        marginTop: 2,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#10b981',
        marginTop: -1,
    },
});
