import React from 'react';
import Box from './ui/Box';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon (ensure it's applied here too if not globally)
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Check if fix already applied to avoid double merge
if (!(L.Icon.Default.prototype as any)._getIconUrl) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

interface OfferMapPreviewProps {
    latitude: number;
    longitude: number;
}

export default function OfferMapPreview({ latitude, longitude }: OfferMapPreviewProps) {
    const position: [number, number] = [latitude, longitude];

    return (
        <Box
            height={200}
            borderRadius={12}
            overflow="hidden"
            marginBottom="l"
            backgroundColor="cardPrimaryBackground"
        >
            {/* @ts-ignore */}
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                dragging={false}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
            </MapContainer>
        </Box>
    );
}
