import React from 'react';
import { useRouter } from 'expo-router';
import Box from './ui/Box';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface FullScreenMapProps {
    offers: any[];
}

export default function FullScreenMap({ offers }: FullScreenMapProps) {
    const router = useRouter();
    const defaultCenter: [number, number] = [23.8103, 90.4125];

    const getOfferLabel = (offer: any) => {
        if (offer.type === 'discount') return `${offer.discountPercentage}% OFF`;
        if (offer.type === 'voucher') return `৳${offer.voucherValue} OFF`;
        if (offer.type === 'coupon') return offer.couponCode;
        return 'Offer';
    };

    const createCustomIcon = (offer: any) => {
        const label = getOfferLabel(offer);
        const title = offer.title.length > 20 ? offer.title.substring(0, 20) + '...' : offer.title;

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background: white;
                    border: 2px solid #10b981;
                    border-radius: 8px;
                    padding: 6px 10px;
                    min-width: 100px;
                    max-width: 150px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    cursor: pointer;
                    text-align: center;
                    transform: translate(-50%, -100%);
                    margin-top: -8px;
                ">
                    <div style="
                        font-size: 11px;
                        font-weight: 700;
                        color: #10b981;
                        line-height: 1.2;
                    ">${label}</div>
                    <div style="
                        font-size: 9px;
                        color: #374151;
                        margin-top: 2px;
                        line-height: 1.2;
                    ">${title}</div>
                </div>
                <div style="
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid #10b981;
                    transform: translate(-50%, -100%);
                    margin-top: -7px;
                    margin-left: 50%;
                "></div>
            `,
            iconSize: [150, 50],
            iconAnchor: [75, 50],
        });
    };

    return (
        <Box flex={1} width="100%" height="100%">
            {/* @ts-ignore */}
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {offers?.map((offer) => {
                    const coordinates = offer.vendor?.location?.coordinates ||
                        offer.city?.centerPoint?.coordinates;

                    if (!coordinates || coordinates.length !== 2) return null;

                    const [longitude, latitude] = coordinates;

                    return (
                        <Marker
                            key={offer.id}
                            position={[parseFloat(latitude), parseFloat(longitude)]}
                            icon={createCustomIcon(offer)}
                            eventHandlers={{
                                click: () => {
                                    router.push(`/offer/${offer.id}`);
                                },
                            }}
                        />
                    );
                })}
            </MapContainer>
        </Box>
    );
}
