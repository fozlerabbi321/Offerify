import React from 'react';
import Box from './ui/Box';
import Text from './ui/Text';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Expo
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface FullScreenMapProps {
    offers: any[];
}

export default function FullScreenMap({ offers }: FullScreenMapProps) {
    // Default center (Dhaka)
    const defaultCenter: [number, number] = [23.8103, 90.4125];

    return (
        <Box flex={1} width="100%" height="100%">
            {/* @ts-ignore - MapContainer types can be tricky with React 18/19 */}
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {offers?.map((offer) => {
                    // Extract coordinates from vendor location or city center (PostGIS Point format)
                    const coordinates = offer.vendor?.location?.coordinates ||
                        offer.city?.centerPoint?.coordinates;

                    if (!coordinates || coordinates.length !== 2) return null;

                    // GeoJSON format is [longitude, latitude]
                    const [longitude, latitude] = coordinates;

                    return (
                        <Marker
                            key={offer.id}
                            position={[parseFloat(latitude), parseFloat(longitude)]}
                        >
                            <Popup>
                                <strong>{offer.title}</strong><br />
                                {offer.vendor?.businessName}<br />
                                {offer.type === 'discount' && `${offer.discountPercentage}% OFF`}
                                {offer.type === 'voucher' && `${offer.voucherValue} BDT OFF`}
                                {offer.type === 'coupon' && `Code: ${offer.couponCode}`}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Box>
    );
}
